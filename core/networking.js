/* networking: the one chapter that teaches network layers, TCP/UDP, HTTP, TLS, DNS and where a round trip goes. Everything else links here. */
(function (root) {
  'use strict';
  root.PREP_CORE = root.PREP_CORE || {};

  root.PREP_CORE['networking-basics'] = {
    id: 'networking-basics',
    title: 'How networks work',
    level: 'warning',
    levelLabel: 'Asked directly now and then, and the rest of the system design track assumes it.',
    why: `Almost every system design answer is really an answer about a network. A load balancer, a timeout, a retry, a cache, a region: each one is a decision about how bytes travel and how long that takes. Interviewers rarely ask "explain TCP" on its own, but they notice immediately when someone says "put a layer 7 balancer here" without being able to say what it can see, or promises a 20 millisecond response to a user on another continent. This chapter gives you the words and the numbers, once, so that every later chapter can use them without stopping to explain.`,
    learn: [
      {
        id: 'nb-0',
        part: 'field',
        title: 'Key terms',
        body: `<ul>
<li><b>Protocol.</b> An agreed set of rules for a conversation between two programs - what messages exist, what order they come in, what each field means. HTTP is a protocol; so is TCP.</li>
<li><b>Packet.</b> The unit a network actually moves: a small block of bytes with a header saying where it is going and a payload carrying the content. A big message is cut into many packets and reassembled at the other end.</li>
<li><b>Header and payload.</b> The header is the labelling a protocol adds; the payload is whatever it was asked to carry. Each layer adds its own header around the payload it was given, which is why the same bytes have several headers by the time they reach the wire.</li>
<li><b>IP address.</b> The address of one machine on the network, for example <code>93.184.216.34</code>. Packets are routed from one of these to another.</li>
<li><b>Port.</b> A number that says which program on that machine the bytes are for: 80 for plain web traffic, 443 for encrypted web traffic, 5432 for a common database. An address plus a port identifies one endpoint of one connection.</li>
<li><b>Router.</b> A device that forwards a packet one step closer to its destination address. A packet crossing the internet passes through ten to thirty of them.</li>
<li><b>Layer.</b> One level of the network stack. Software is built in layers so that each level can use the level below it without knowing how it works: your code asks for "send this message to this server" and never touches a cable.</li>
<li><b>TCP.</b> Transmission control protocol: a connection that guarantees every byte arrives, once, in the order it was sent, by numbering the bytes and resending anything lost.</li>
<li><b>UDP.</b> User datagram protocol: single packets sent with no connection, no ordering and no resending. Cheaper and faster to start, and the program has to cope with loss itself.</li>
<li><b>Datagram.</b> One self-contained packet that stands on its own, with no connection behind it. UDP sends datagrams.</li>
<li><b>Handshake.</b> The short exchange two machines have before real data flows, to agree that a connection exists and, for encryption, to agree on keys.</li>
<li><b>Round-trip time (RTT).</b> How long a message takes to reach the other side and the answer to come back. It is the unit almost everything in this chapter is measured in.</li>
<li><b>Latency and bandwidth.</b> Latency is how long one message takes to arrive; bandwidth is how many bytes per second the link can carry. A fatter pipe does not make a message arrive sooner.</li>
<li><b>HTTP.</b> The application protocol the web runs on: the client sends a request (a method, a path, headers, sometimes a body) and the server sends back a response (a status code, headers, a body).</li>
<li><b>HTTP method.</b> The verb of a request: <code>GET</code> reads, <code>POST</code> creates, <code>PUT</code> replaces, PATCH (changes only the fields included in the request) edits, <code>DELETE</code> removes.</li>
<li><b>Status code.</b> The three-digit result of a request: 2xx worked, 3xx go somewhere else, 4xx the caller got it wrong, 5xx the server got it wrong.</li>
<li><b>Multiplexing.</b> Running several independent conversations over one connection at the same time, instead of one after another.</li>
<li><b>Head-of-line blocking.</b> One slow or missing item holding up everything queued behind it, even though the items have nothing to do with each other.</li>
<li><b>QUIC.</b> A newer transport protocol built on UDP that does ordering, loss recovery and encryption itself, per stream rather than per connection. HTTP/3 runs on it.</li>
<li><b>TLS.</b> Transport layer security: the encryption that turns HTTP into HTTPS. It hides the content, detects tampering, and proves the server really is the name you asked for.</li>
<li><b>Certificate.</b> A signed statement that a particular public key belongs to a particular name, issued by a certificate authority that browsers and operating systems already trust.</li>
<li><b>TLS termination.</b> The point where encryption is undone and the request becomes readable - usually a content delivery network (CDN) edge or a load balancer, not the application itself.</li>
<li><b>Session resumption.</b> Re-using the result of an earlier TLS handshake so a returning client can skip most of it.</li>
<li><b>DNS.</b> Domain name system: the directory that turns a name like <code>example.com</code> into an IP address.</li>
<li><b>Recursive resolver.</b> The server that does the looking-up on your behalf, asking the root servers, then the <code>.com</code> servers, then the servers that own the name.</li>
<li><b>Authoritative name server.</b> The server that actually holds the answer for a name, because its owner publishes it there.</li>
<li><b>Time to live (TTL).</b> How many seconds a DNS answer may be kept in a cache before it must be looked up again. It is the dial between fast change and few lookups.</li>
<li><b>Keep-alive.</b> Leaving a connection open after a response so the next request can use it instead of paying for a new handshake.</li>
<li><b>Connection pool.</b> A set of already-open connections a program keeps to a server, handed out to whatever needs one, so the handshake cost is paid once rather than per request.</li>
<li><b>Proxy.</b> Something that sits in the middle of a connection and passes traffic on, possibly changing it. A load balancer is a proxy that chooses which server to pass it to.</li>
<li><b>Propagation delay.</b> Time lost purely to distance, because a signal cannot travel faster than light. In fibre that is about 200,000 kilometres a second.</li>
<li><b>Queuing delay.</b> Time a packet or a request spends waiting in a buffer because something ahead of it is still being handled. It is the part of latency that grows under load.</li>
</ul>`,
        deeper: `<p>Two of these are worth getting straight before anything else, because most confusion in this subject comes from mixing them up. The first is latency against bandwidth: buying a bigger link does nothing for a message that is slow because the other machine is far away. The second is a layer against a protocol: a layer is a job (move packets, move a stream of bytes, carry a message), and a protocol is one particular way of doing that job. TCP and UDP are two protocols doing the same layer's job, and the whole reason HTTP can move from TCP to QUIC without applications being rewritten is that the layer boundary held.</p>`,
        check: {
          question: 'A service answers in 5 milliseconds when tested from a machine beside it, and in 180 milliseconds from a laptop on another continent. The link at both ends is fast. What is the most likely explanation?',
          options: [
            'The server is slower for remote callers because it does more work for them',
            'Most of the 180 milliseconds is distance and handshakes rather than server time, and no amount of extra bandwidth will remove it',
            'The bandwidth of the remote link must be too small',
            'Remote requests are always routed through a slower version of the service'
          ],
          answer: 1,
          explain: 'The server work is the same 5 milliseconds in both cases. What changed is the number of round trips and how long each one takes, and a round trip across an ocean has a floor set by the speed of light in fibre. Bandwidth changes how many bytes per second flow, not how long the first one takes to arrive.'
        }
      },
      {
        id: 'nb-layers',
        part: 'field',
        title: 'The network layers, all seven of them',
        viz: 'network-layers',
        body: `<p>Network software is built in layers. Each layer does one job, uses the layer below it, and hides how that layer works. That is why you can write <code>send(socket, bytes)</code> and never think about radio waves, and why a program can be moved from a cable to Wi-Fi without a single line changing. A layer takes what it was handed, wraps its own header around it, and passes it down; on the way back up each layer strips its own header off and hands the rest to the layer above.</p>
<p><b>One request, from the bottom up.</b> Say your browser asks for a product page. At the <b>physical layer</b> there is only a signal - voltage on copper, light in fibre, radio in the air. The <b>data link layer</b> gets that signal across one hop, from your laptop to the router in your house, addressed by a hardware address (also called a MAC address, for media access control) that means nothing more than one step away. The <b>network layer</b>, layer 3, is where an IP address lives: it moves packets from your address to the server's address, choosing a route through however many routers lie between, with no promise that they arrive or that they arrive in order. The <b>transport layer</b>, layer 4, turns that into something a program can use: an address and a port at each end, either as a TCP connection that guarantees an ordered stream of bytes, or as UDP datagrams that do not. The <b>session</b> and <b>presentation</b> layers, 5 and 6, are meant to cover keeping a conversation open across exchanges and how the content is encoded and encrypted. The <b>application layer</b>, layer 7, is where the message itself is visible at last: <code>GET /products/42</code>, a host header, a cookie, a JSON body.</p>
<p><b>Where the numbers come from.</b> They come from the OSI (Open Systems Interconnection) reference model, a seven-layer diagram published as an international standard in the 1980s. Nobody implements it. What everything actually runs on is the four-layer model that grew up around TCP and IP: link, internet, transport, application - and that last one swallows OSI layers 5, 6 and 7 whole. So the seven-layer picture is a teaching diagram that gave the industry a shared vocabulary, and the vocabulary outlived the model.</p>
<p><b>Which numbers people actually say.</b> Three: layer 3, layer 4 and layer 7. Layers 1 and 2 belong to cables and switches, so they are named by network engineers and almost never in a system design conversation. Layers 5 and 6 have no separate piece of software to point at - TLS is the textbook example of layer 6, and in practice it is a library sitting between TCP and HTTP that nobody calls layer 6. So when an engineer says "layer 4 or layer 7?", they are asking one question: how much of the message is this thing allowed to look at?</p>
<p><b>What each layer can and cannot see.</b> This is the fact every later use of these words depends on. A layer 3 device sees the source and destination IP addresses, and nothing else. A layer 4 device sees those plus the ports, and can therefore tell one connection from another - but the bytes flowing inside are opaque to it, so it cannot tell you which page was requested, or even where one request ends and the next begins. A layer 7 device sees the request as a request: method, path, headers, body. The price is that it must first decrypt TLS, and then parse and often buffer the message, which is real work per request rather than per packet.</p>`,
        deeper: `<p>The OSI model came out of a standards effort that competed with TCP/IP and lost. The layering survived anyway, because the numbers gave people a quick way to say how deep something looks. That is also why the numbering is uneven in practice: "layer 2 versus layer 3" is a real distinction to a network engineer choosing a switch, and "layer 4 versus layer 7" is a real distinction to anyone choosing a load balancer, but almost nothing is ever described as layer 5 or layer 6 outside a textbook. If you ever want to place something that does not fit, the honest answer is that the model is a diagram, not a specification, and TLS sits awkwardly between layers 4 and 7 no matter how hard you squint.</p>`,
        check: {
          question: 'A load balancer needs to send requests whose path starts with /images to one group of servers and everything else to another. Why can a layer 4 balancer not do this?',
          options: [
            'A layer 4 balancer is too slow to make routing decisions',
            'Layer 4 sees only addresses and ports; the path is inside the message, which only a layer 7 device parses - and it must decrypt TLS first to read it',
            'Layer 4 balancers can only handle one server at a time',
            'The path is encrypted in a way no device can ever read'
          ],
          answer: 1,
          explain: 'The path lives in the HTTP request, which is application-layer content. A layer 4 device deals in addresses, ports and connections, and the bytes carried inside are just bytes to it. To route on the path you need something that terminates TLS and parses the request, which is what layer 7 means.'
        }
      },
      {
        id: 'nb-f2',
        part: 'field',
        title: 'TCP and UDP: what a connection costs and what it buys',
        viz: 'tcp-handshake',
        body: `<p><b>The handshake.</b> Before TCP carries a single byte of your data, the two sides exchange three messages: SYN (short for synchronize) from the client, SYN-ACK back from the server, and ACK (acknowledge) from the client. The client can attach its request to that third message, so the practical cost is <b>one full round trip before the request even leaves</b>, and the answer arrives one round trip after that. Between New York and London that is about 56 milliseconds spent on nothing but agreeing to talk.</p>
<p><b>Ordering and resending.</b> TCP numbers every byte it sends and the receiver acknowledges what it has. Anything unacknowledged is sent again. That is the guarantee applications want: whatever you wrote comes out the other end complete and in order, or the connection fails and you know about it.</p>
<p><b>Why one lost packet delays everything behind it.</b> The guarantee is ordered delivery, so the receiving TCP will not hand any later bytes up to the application until the missing ones arrive. Packets that already arrived sit in a buffer, complete and useless, until the retransmission of the one in front turns up a round trip later. That is head-of-line blocking at the transport layer, and it is why a connection carrying several unrelated things stalls all of them when one packet goes missing.</p>
<p><b>A new connection is also slow.</b> TCP does not start at full speed. Congestion control begins with a small window and doubles it each round trip until it sees loss, so the first few round trips on a fresh connection carry far less than the link could. A short-lived connection may finish before it ever reaches full speed, which is another reason to keep connections open.</p>
<p><b>When UDP is the right answer.</b> UDP gives you none of the above: no handshake, no ordering, no resending. That is exactly right in three cases. When a late packet is worthless - a video frame or a moment of speech that has already gone past - waiting for a retransmission is worse than dropping it. When the whole exchange is one small question and one small answer, a DNS lookup being the classic example, a handshake would double the cost for nothing. And when you want to build reliability yourself, on your own terms: that is what QUIC does, recovering each stream separately instead of blocking the whole connection.</p>`,
        deeper: `<p>The sentence that makes a UDP choice sound considered rather than reflexive is the one that names what you are giving up. "I am accepting that some frames will simply never arrive, because a frame recovered 200 milliseconds late is one nobody can use anyway" is an answer. "UDP is faster" is not, and invites the follow-up you do not want. It is also worth knowing that choosing UDP does not mean choosing unreliability: QUIC runs on UDP and is more reliable than TCP for multiplexed traffic, precisely because it rebuilt loss recovery per stream instead of per connection.</p>`,
        check: {
          question: 'Three unrelated downloads share one TCP connection. One packet belonging to the first download is lost. What happens to the other two?',
          options: [
            'They continue normally, because TCP tracks each download separately',
            'They stall as well: TCP delivers bytes in order and has no idea the three are unrelated, so everything behind the gap waits for the retransmission',
            'They are automatically moved to a new connection',
            'They fail with an error and must be restarted'
          ],
          answer: 1,
          explain: 'TCP presents one ordered stream of bytes. It knows nothing about the logical things multiplexed inside it, so a gap anywhere holds back everything that arrived after it until the missing bytes are resent. Removing that limitation is the reason HTTP/3 moved to QUIC.'
        }
      },
      {
        id: 'nb-f3',
        part: 'field',
        title: 'HTTP: requests, responses, and three versions of one protocol',
        viz: 'http-versions',
        body: `<p><b>The shape of it.</b> A request is a method, a path, a set of headers and sometimes a body. A response is a status code, a set of headers and usually a body. Everything else in HTTP is a convention layered on those few fields.</p>
<p><b>Methods.</b> <code>GET</code> reads and must change nothing, which is what makes it safe to retry and to cache. <code>POST</code> creates or triggers something and is the one method that is not safe to repeat blindly. <code>PUT</code> replaces a resource, PATCH (changes only the fields included in the request) edits part of one, and <code>DELETE</code> removes it. <code>PUT</code> and <code>DELETE</code> are idempotent: doing them twice leaves the same state as doing them once.</p>
<p><b>Status codes.</b> The first digit is the whole story. 2xx worked (200 fine, 201 created, 204 nothing to send back). 3xx means look elsewhere (301 permanently moved, 304 your cached copy is still good). 4xx means the caller is wrong (400 malformed, 401 not authenticated, 403 authenticated but not allowed, 404 no such thing, 409 conflicts with current state, 429 too many requests). 5xx means the server is wrong (500 it broke, 502 a server upstream gave a bad answer, 503 temporarily unable, 504 something upstream timed out). The practical value is that a caller can decide what to do from the first digit alone: retrying a 5xx or a 429 can help, retrying a 4xx never will.</p>
<p><b>Headers.</b> Small named fields carrying everything that is not the body: which host the request is for, what type the body is, what the caller will accept, how long the answer may be cached, and who the caller is.</p>
<p><b>HTTP/1.1.</b> One request at a time per connection. Keep-alive lets the next request re-use the connection, which saves the handshake, but requests still queue one behind another - so a slow response blocks everything behind it. Browsers work around this by opening about six connections per host, which is six handshakes and six congestion-control ramps for one page.</p>
<p><b>HTTP/2.</b> Many requests are multiplexed as independent streams over a single connection, with headers compressed. That removes the queue at the message level and the need for six connections. It does not remove TCP's own head-of-line blocking: the streams are independent to HTTP and invisible to TCP, so one lost packet still stalls every stream sharing the connection.</p>
<p><b>HTTP/3.</b> The same multiplexing, but over QUIC, which runs on UDP and does its own ordering and loss recovery per stream. A lost packet now delays only the stream that lost it. Moving to UDP was not about speed for its own sake: it was the only way to replace TCP's single ordered stream, because TCP's behaviour is fixed in operating systems and middleboxes and cannot be changed from an application. QUIC also folds the encryption handshake into the connection handshake, so a new connection costs one round trip instead of two, and it identifies a connection by an identifier rather than by the address pair, so a phone moving from Wi-Fi to mobile data keeps its connection instead of rebuilding it.</p>`,
        deeper: `<p>A useful way to remember the three: HTTP/1.1 fixed re-using the connection, HTTP/2 fixed queueing inside it, and HTTP/3 fixed the fact that the connection underneath was still a single ordered stream. Each version removed one head-of-line blocking problem and revealed the next one down. The gains are also uneven in practice - HTTP/2 helps most on pages with many small resources, and HTTP/3 helps most on networks that actually lose packets, which is mobile. On a clean wired link between two servers in the same region, the difference between the three is small, and it is fair to say so.</p>`,
        check: {
          question: 'What does HTTP/3 fix that HTTP/2 does not?',
          options: [
            'It compresses headers, which HTTP/2 does not do',
            'It removes head-of-line blocking in the transport underneath: because QUIC recovers each stream separately, a lost packet delays only its own stream rather than every stream on the connection',
            'It allows more than one request per connection for the first time',
            'It encrypts traffic, which earlier HTTP versions could not'
          ],
          answer: 1,
          explain: 'HTTP/2 already multiplexes and compresses headers, but it runs on TCP, which delivers one ordered byte stream and therefore stalls all multiplexed streams on any loss. QUIC keeps per-stream state itself, so only the affected stream waits.'
        }
      },
      {
        id: 'nb-f4',
        part: 'field',
        title: 'TLS: what it guarantees and what the handshake costs',
        body: `<p><b>Three guarantees.</b> TLS gives you confidentiality (a watcher in the middle sees encrypted bytes, not your content), integrity (any tampering is detected and the connection fails rather than delivering altered data), and authentication of the server (the certificate it presents is signed by a certificate authority your machine already trusts, and it names the host you asked for). Mutual TLS extends the third one both ways, so the server also checks the client's certificate - that is how services inside a mesh identify each other without passwords.</p>
<p><b>What it does not give you.</b> It does not hide that you are talking to that server: the IP address is in the clear, and so, on most connections today, is the hostname the client asks for during the handshake, in a field called server name indication (SNI). It also says nothing about whether the server deserves trust. A certificate proves the name matches, not that the operator is honest.</p>
<p><b>What the handshake costs.</b> TLS 1.3 needs one round trip on top of the TCP handshake, so a first HTTPS request across the Atlantic pays roughly two round trips - about 112 milliseconds - before the request is sent. TLS 1.2 needs two, making it three. The expensive part is the asymmetric cryptography used once to agree on keys; after that the traffic is protected with symmetric encryption that costs very little per byte. So the cost of TLS is almost entirely per connection, not per megabyte, which is another way of saying that connection reuse matters more than payload size.</p>
<p><b>Session resumption.</b> A server can hand the client a ticket that lets a later connection skip most of the handshake, bringing it down to one round trip. TLS 1.3 goes further with early data, where the client sends its request in the very first packet, at zero extra round trips. The catch is that early data can be replayed by an attacker who captures it, so it is only safe for requests that are harmless to repeat - which in practice means idempotent reads.</p>
<p><b>Where it is terminated.</b> Almost always at the edge: a content delivery network node or a load balancer close to the user ends the encrypted connection there. Two reasons. The handshake's round trips are then short, because the edge is near the user even when the origin is not. And the request becomes readable, which is the only way a layer 7 proxy can route on a path, apply a per-caller rate limit or retry a request. What happens after that is a choice: plain HTTP inside a trusted network, or a second encrypted connection to the origin, or mutual TLS between every pair of services if the network is not trusted.</p>`,
        deeper: `<p>Two numbers make the edge argument concrete. Suppose a user in Sydney and an origin in Virginia, a round trip of about 200 milliseconds. Terminating TLS at the origin means TCP plus TLS 1.3 costs two of those round trips, 400 milliseconds, before the request is sent. Terminating at a content delivery network node in Sydney - a round trip of maybe 5 milliseconds - costs 10 milliseconds for the same two handshakes, and the already-open, already-warm connection from that node to the origin carries the request onward. The user's slow leg now pays for one round trip instead of three. This is most of what a content delivery network does for content it cannot cache at all.</p>`,
        check: {
          question: 'A team moves TLS termination from their origin servers to edge nodes near their users, and first-request latency drops sharply even though the origin is still just as far away. Why?',
          options: [
            'Encryption is faster on edge hardware',
            'The handshakes now happen over a short round trip to the nearby edge instead of a long one to the origin, and the edge already holds a warm connection onward',
            'The edge caches the response, so the origin is not involved',
            'TLS 1.3 is only supported at the edge'
          ],
          answer: 1,
          explain: 'The saving is round trips over distance, not processing. The TCP and TLS handshakes are several round trips, and moving them from a 200 millisecond path to a 5 millisecond path removes most of the wait. The connection from edge to origin is already open, so it costs no handshake at all.'
        }
      },
      {
        id: 'nb-f5',
        part: 'field',
        title: 'DNS: how a name becomes an address',
        viz: 'dns-lookup',
        body: `<p><b>The walk down.</b> Your machine asks a recursive resolver - one run by your network, your company or a public provider. If the resolver does not already know the answer it starts at the top: a root name server tells it which servers handle <code>.com</code>, those tell it which servers are authoritative for <code>example.com</code>, and the authoritative server returns the address. The resolver caches every step and hands you the answer. An answer is an address record for a name, or a CNAME (canonical name), an alias record saying this name means that other name, which the resolver then has to resolve in turn.</p>
<p><b>Caching and time to live.</b> Every answer carries a time to live, in seconds, and everything that sees it - the authoritative server's clients, the recursive resolver, the operating system, often the browser - may keep it for that long. This is the only reason DNS scales: the root servers are not asked about your website, because almost every lookup is answered from a cache somewhere on the way. The time to live is a straight trade. A long one (say 24 hours) means very few lookups and very slow change. A short one (say 60 seconds) means changes take effect quickly and every cache has to ask again far more often.</p>
<p><b>Why a slow lookup looks like a slow first request.</b> The lookup happens before the connection is opened, so it is added latency that lands entirely on the first request to a host and then disappears. A cold lookup that has to walk from the root can take several round trips - 100 milliseconds or more is normal, and much worse on a poor mobile network. Users experience that as "the app was slow when I opened it and fine afterwards", and it will not show up in your server-side latency graph at all, because your server never saw it.</p>
<p><b>Why DNS is a poor failover mechanism.</b> It is tempting to fail over by changing the address a name points at. In practice the change reaches clients slowly and unevenly: caches hold the old answer for the whole time to live, some resolvers round short values up, and some client libraries resolve a name once at start-up and never again. If you need failover in seconds, do it somewhere you control - an address that stays the same while the traffic behind it moves, or a load balancer that changes which servers it uses. Keep DNS for changes you can wait out.</p>`,
        deeper: `<p>The lookup is a good example of why UDP exists. A DNS query and its answer are usually one small packet each, so a TCP handshake would double the cost of the exchange to gain a guarantee that a simple retry provides just as well. Encrypted variants that run the same queries over TLS or HTTPS accept that extra cost in exchange for hiding which names you look up, which is a privacy decision rather than a performance one. And the reason a resolver can answer at all without asking anyone is the cache: the practical effect of a 300 second time to live is that at most one client in that window pays the full walk down from the root, and everyone else is served from memory.</p>`,
        check: {
          question: 'A team sets a 24-hour time to live on their main record, then needs to move traffic to a different address during an incident. What actually happens?',
          options: [
            'All clients pick up the new address within a few seconds',
            'Clients keep using the old address for up to a day, because resolvers, operating systems and libraries are all entitled to keep the cached answer for the full time to live',
            'The change is rejected until the time to live expires',
            'Only clients that have never visited before are affected'
          ],
          answer: 1,
          explain: 'A time to live is permission to cache for that long, and every cache along the way takes it. That is why fast failover is built on something you control at request time, and why records that might need to move carry short values in the first place.'
        }
      },
      {
        id: 'nb-f6',
        part: 'field',
        title: 'Where the time goes in a round trip',
        viz: 'round-trip-budget',
        body: `<p>Latency is made of four things, and it helps to name which one you are fighting.</p>
<ul>
<li><b>Propagation.</b> Distance divided by speed. Light in fibre covers about 200,000 kilometres a second, and the cable does not run in a straight line. New York to London is 5,585 kilometres, which is 56 milliseconds for a round trip at the theoretical best and about 70 in practice. New York to Sydney is 15,993 kilometres, about 160 milliseconds. Inside one data centre a round trip is about half a millisecond. These numbers are physics plus routing, and no engineering removes them.</li>
<li><b>Transmission.</b> How long it takes to push the bytes onto the link: size divided by link rate. This is the only part that a bigger link improves, and for small requests it is negligible.</li>
<li><b>Queuing.</b> Time spent waiting in a buffer, in a router, in a load balancer, in a thread pool, in a connection pool. It is near zero when things are quiet and grows sharply as any stage approaches saturation, which is why it is what makes p99 (the value below which 99 percent of requests fall) far worse than the median.</li>
<li><b>Processing.</b> The server's own work, plus every dependency it calls while you wait.</li>
</ul>
<p><b>Add up a first request.</b> A user in New York calls a service in London, over HTTPS, with nothing cached: a DNS lookup at 30 milliseconds, a TCP handshake at 56, a TLS 1.3 handshake at 56, the request travelling at 28, 30 milliseconds of server work, and the answer travelling back at 28. That is 228 milliseconds, of which 142 - nearly two-thirds - is handshakes and lookup, and only 30 is the service doing anything.</p>
<p><b>Which is why connections are kept open.</b> With keep-alive, the second request on that connection costs 28 plus 30 plus 28, or 86 milliseconds. A connection pool does the same thing for a service calling another service: keep a set of connections open and hand them out, so the handshake is paid at start-up rather than per request. It also avoids the slow start ramp, since a warm connection is already running at full speed.</p>
<p><b>What actually shortens the rest.</b> Fewer round trips (one batched call instead of five sequential ones), or less distance (serve from a region or an edge near the user). Bandwidth does not help a latency problem, and neither does a faster server when it was only 30 of the 228 milliseconds. This is also why a design that is perfectly reasonable inside one region - a chain of five internal calls, half a millisecond each - becomes unusable when the same chain crosses an ocean.</p>`,
        deeper: `<p>Worth doing this arithmetic out loud in an interview, because it changes the answer. If someone asks for a p99 of 100 milliseconds for users on another continent, the honest response is that a single round trip already costs more than half of that, so the design has to put something near the user - an edge, a read replica, a regional deployment - rather than tuning the service. The same reasoning applies inside a system: a request that makes five sequential calls to a store 1 millisecond away spends 5 milliseconds on nothing but waiting, and batching those five into one call recovers 4 of them without making anything faster.</p>`,
        check: {
          question: 'A first HTTPS request from another continent takes 228 milliseconds, of which the service itself accounts for 30. The team doubles the bandwidth at both ends. What should they expect?',
          options: [
            'Roughly half the latency, since bandwidth was the bottleneck',
            'Almost no change, because the time is round trips over distance; the fixes are to reuse connections, make fewer round trips, or move closer to the user',
            'A large improvement, because handshakes scale with bandwidth',
            'Slower responses, because larger links have more queuing'
          ],
          answer: 1,
          explain: 'Bandwidth affects transmission time, which is a tiny part of a small request. The 198 milliseconds that is not server work is propagation and handshakes, and those are removed by keeping connections open, batching calls together, or shortening the distance.'
        }
      },
      {
        id: 'nb-f7',
        part: 'field',
        title: 'What this means when you design',
        viz: 'l4-vs-l7-lb',
        body: `<p><b>Layer 4 or layer 7, and what each can decide on.</b> A layer 4 balancer sees an address, a port and a connection. It can pick a server by rotation, by fewest open connections, or by a hash of the client address, and it can stop sending to a server that fails a health check. It cannot see a path, a host header or a cookie, cannot split traffic by request type, and cannot retry a request, because it does not know where one request ends. In exchange it is cheap, works for any protocol at all - a database connection, a game server, anything - and adds almost no latency. A layer 7 balancer terminates TLS and parses the request, so it can route by path or hostname, send one percent of traffic to a new version, retry an idempotent request on a different server, apply a per-caller rate limit, and return a useful error instead of a dropped connection. The cost is real work per request, a little added latency, and the fact that it must hold the decrypted request to do any of it.</p>
<p><b>Where timeouts and retries belong.</b> Every remote call needs a timeout, and it must be smaller than whatever time the caller has left, or one slow dependency holds resources open across the whole chain. Better still is a deadline that travels with the request, so each hop knows how much of the budget remains and a hop with nothing left fails immediately instead of doing work nobody is waiting for. Retries belong where the meaning of the request is known - in the client, or in a layer 7 proxy that can tell a read from a payment. A layer 4 device must never retry, because to it every request looks the same. And every retry should carry backoff and randomness, since a dependency that starts failing is the worst possible moment to send it several times its normal load.</p>
<p><b>Why a proxy that reads the request costs more.</b> Forwarding packets is nearly free. Reading a request means terminating TLS, parsing headers, often buffering the whole body before passing it on, and holding state for that request until it completes. That is more processor time, more memory per connection, and one more place where a request can queue. It is usually worth it, because routing, retries and rate limits have to happen somewhere - but it is a component with its own capacity, its own p99 and its own failure mode, not a free line on the diagram.</p>
<p><b>Saying it in an interview.</b> "Put a load balancer here" is only half an answer. The half that counts is the next sentence: which layer, what it decides on, and what it therefore cannot do. If the design needs path-based routing, a canary split or request retries, it needs layer 7 and you should say why. If it is a high-throughput stream of connections where nothing needs to be read, layer 4 is both cheaper and simpler, and saying so shows you know the difference costs something.</p>`,
        deeper: `<p>The two are often used together, and being able to say why is a good sign. A common arrangement is a layer 4 device at the front, distributing raw connections across a fleet of layer 7 proxies, which then terminate TLS and route on the request. The layer 4 stage is there because it can absorb enormous connection volume cheaply and needs no knowledge of the protocol; the layer 7 stage is there because everything interesting requires reading the request. The same logic explains why TLS is terminated at the edge rather than at the application: the moment you want to route, retry or limit by anything inside the message, something has to be able to read it, and the earliest place that can safely happen is the first component you control.</p>`,
        check: {
          question: 'A team wants to send 5 percent of traffic to a new version of a service, chosen by a header the client sets, and to retry failed reads on another replica. What does that require?',
          options: [
            'Layer 4 balancing, since it is faster and header routing is a layer 4 feature',
            'Layer 7 balancing, because both splitting on a header and retrying a request require reading and understanding the request itself',
            'Neither: this is decided by DNS',
            'Layer 3 routing, since the decision is about addresses'
          ],
          answer: 1,
          explain: 'A header lives inside the HTTP message, and a retry needs to know where one request begins and ends and whether repeating it is safe. Both are application-layer facts, so both need a component that terminates TLS and parses the request.'
        }
      }
    ],
    connect: null,
    activities: [
      {
        id: 'nb-a1',
        type: 'design',
        title: 'Account for every millisecond of a first request from Sydney',
        viz: 'round-trip-budget',
        prompt: `"A user in Sydney opens our app for the first time and calls our API, which runs in one region in Virginia. The call takes about 700 milliseconds and our server logs say we spent 40 milliseconds on it. Walk me through where the rest of the time went, and what you would change."`,
        timeboxSec: 900,
        rubric: `Marking guide, out of 10. (1) Separates the parts of the latency explicitly - DNS lookup, TCP handshake, TLS handshake, request travel, server work, response travel - rather than treating the number as one lump. (2) States a round-trip time for the path and uses it consistently; Sydney to the eastern United States is roughly 200 milliseconds, and any figure between about 180 and 250 is fine if it is stated. (3) Counts round trips correctly: one for the TCP handshake, one more for TLS 1.3 (two for TLS 1.2), one for the request and answer, plus the DNS lookup before any of it. (4) Concludes from the arithmetic that handshakes and distance dominate and server time is a small fraction, so tuning the service would achieve almost nothing. (5) Proposes ending TLS near the user - a content delivery network or edge point of presence in or near Australia - and explains that the saving is the handshakes happening over a short round trip and the onward connection being already open. (6) Mentions connection reuse: keep-alive and a connection pool, so only the first request pays. (7) Mentions that the cold DNS lookup is a first-request cost that never appears in server-side latency graphs. (8) Considers, and correctly bounds, the options that do not help - more bandwidth, a faster server, a larger instance. (9) Names the option that genuinely removes the distance if latency targets demand it: serving read traffic from a region near the user, with whatever consistency cost that carries. (10) Ends with a stated first change and why it is first. Deduct for: quoting a latency target that is below one round trip for the path; proposing bandwidth as the fix; forgetting that the handshakes are per connection rather than per request; treating the whole 700 milliseconds as server-side. {{HONESTY}}`,
        model: `"With 40 milliseconds of server time, roughly 660 milliseconds is network, and I would account for it in round trips. Sydney to Virginia is about 200 milliseconds for a round trip, so almost everything here is a small number of those.

The first request pays four separate things. A cold DNS lookup - the resolver may have to walk down from the root, so call it 100 to 150 milliseconds on a first visit. Then the TCP handshake, one round trip, 200. Then the TLS 1.3 handshake, another round trip, 200. Then the request itself: about 100 out, 40 of server work, 100 back. That adds up close to the 700 we are seeing, and only 40 of it is us.

So the fix is not the service. Two changes. First, terminate TLS at an edge point of presence near the user - Sydney if we have one. The two handshakes then happen over a 5 millisecond round trip instead of a 200 millisecond one, and the connection from the edge back to Virginia is already open and warm, so the user's slow leg pays for one round trip rather than three. That alone should take several hundred milliseconds off the first request. Second, make sure we are actually reusing connections: keep-alive on the client, a connection pool between services, so the second and later requests cost one round trip plus server time.

What I would not do is add bandwidth or a bigger instance - neither touches the part that is slow. If we still need to be under, say, 150 milliseconds after that, the only thing left to change is distance: serve reads from a region in Australia and accept the replication lag that comes with it. I would start with the edge termination, because it is the largest saving for the least change to the system."`
      },
      {
        id: 'nb-a2',
        type: 'explain',
        title: 'Explain layers 4 and 7 to someone who has never heard the terms',
        viz: 'network-layers',
        prompt: `"You keep saying layer 4 and layer 7. Explain what those mean to someone who has never heard the words, and tell me one thing each can do that the other cannot."`,
        timeboxSec: 300,
        rubric: `Must-haves: (1) explains what a layer is at all before using a number - software built in levels, each using the one below and hiding its detail. (2) Says what layer 4 is: the transport layer, where a connection is an address and a port carried by TCP or UDP, and the content inside is opaque. (3) Says what layer 7 is: the application layer, where the message itself is visible - method, path, headers, body. (4) Says where the numbers come from and does not overstate them: a seven-layer reference model that nobody implements, whose numbering survived as everyday shorthand. (5) Names one thing only layer 7 can do - route by path or hostname, split traffic by header, retry a request, rate limit per caller - and explains that it requires reading the request, which means terminating TLS first. (6) Names one thing layer 4 does better - works for any protocol, not just HTTP, and costs almost nothing per packet - rather than treating layer 7 as strictly superior. (7) Mentions layer 3 at least in passing as the layer where an IP address lives, so the numbers are not floating free. Common mistakes: reciting all seven layer names with no explanation of what a layer is; claiming layer 7 is always the right answer; saying a layer 4 balancer "sees the request but ignores it". {{HONESTY}}`,
        model: `"Network software is built in levels, and each level uses the one below it without needing to know how it works. That is what a layer is. It is why my code can say 'send these bytes to that server' and never think about cables.

Layer 3 is where an IP address lives - it moves packets between machines. Layer 4 sits on top of that and adds a port, so instead of 'this machine' you get 'this program on this machine', either as a TCP connection or as UDP datagrams. What matters is that at layer 4 the bytes flowing through are just bytes. Layer 7 is the top: the message itself, so for HTTP that is the method, the path, the headers and the body.

The numbers come from an old seven-layer reference model that nobody actually implements - real systems have four layers - but the numbering stuck as shorthand, and in practice people only ever say 3, 4 and 7.

Something only layer 7 can do: send every request for /images to one group of servers and everything else to another, or retry a failed read on a different replica. Both need the request to be readable, which means terminating TLS and parsing it.

Something layer 4 does better: everything else. It works for any protocol, not just HTTP - a database connection, a game server - and it costs almost nothing per packet, because it is forwarding rather than parsing. So the choice is really one question: does this thing need to understand the request, or just move it?"`
      },
      {
        id: 'nb-a3',
        type: 'followup',
        title: 'Interview question: why is our mobile app slow on a bad network?',
        prompt: `An interviewer asks: "Our mobile users on poor networks in another country complain the app is slow, but our server latency looks fine. What would you look at, and what would you change?" Answer in first person, in about 90 seconds.`,
        timeboxSec: 300,
        rubric: `Must-haves: (1) starts from the observation that server-side latency graphs cannot see any of DNS, handshakes or the network path, so "our latency looks fine" is expected rather than contradictory. (2) Names the first-request costs specifically - a cold DNS lookup, then the TCP handshake, then the TLS handshake - and that they are per connection, not per request. (3) Names packet loss as the thing that separates a poor network from a slow one, and explains the consequence correctly: TCP delivers in order, so one lost packet stalls everything behind it on that connection. (4) Proposes HTTP/3 over QUIC as a real fix for that specific problem, with the reason - per-stream loss recovery, and connection migration so switching from Wi-Fi to mobile data does not rebuild the connection - not just because it is newer. (5) Proposes connection reuse and fewer round trips - keep-alive, batching several calls into one, avoiding a chain of sequential requests. (6) Proposes ending TLS at an edge near those users. (7) Says how they would confirm it rather than guessing: measure from the client, not the server. Common mistakes: proposing more bandwidth; blaming the server; naming HTTP/3 with no reason attached; forgetting that the evidence has to come from the client side. {{HONESTY}}`,
        model: `"Our graphs looking fine is exactly what I would expect. We measure from the moment a request reaches us, and the DNS lookup, the TCP handshake, the TLS handshake and the whole network path all happen before that. So I would start by measuring from the client: the time before the first byte, separately from the response itself.

I would expect two causes. First, first-request cost. A cold DNS lookup on a poor mobile network can take a few hundred milliseconds on its own, and then TCP and TLS are two more round trips before we send anything. If the app opens a fresh connection per call, it pays that again and again.

Second, packet loss - that is what makes a bad network different from a slow one. TCP delivers one ordered stream, so a single lost packet stalls every request sharing that connection until it is resent, another round trip later. That gives exactly the pattern people describe: mostly fine, then a long freeze.

What I would change: move to HTTP/3, because QUIC recovers each stream on its own so loss delays only that stream, and because it keeps the connection alive when a phone switches from Wi-Fi to mobile data. Keep connections open instead of opening one per call. Batch the sequential calls we make at start-up into fewer round trips, which is usually the biggest single win. And terminate TLS at an edge near those users so the handshakes are short.

Then I would confirm it with client-side numbers, because all of that is a hypothesis until it is measured where the user is."`
      }
    ],
    sayQuestion: null,
    sayItOutLoud: null,
    readings: [
      { l: 'PRIMER: What is the OSI model? (Cloudflare)', u: 'https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/', w: 'The clearest short walk through all seven layers, one paragraph each, with an example at every level - read it once and layer 5 stops being a mystery.', m: 12 },
      { l: 'High Performance Browser Networking: Building Blocks of TCP', u: 'https://hpbn.co/building-blocks-of-tcp/', w: 'The definitive free explanation of the handshake, congestion control and slow start, with the round-trip arithmetic written out. This is where the handshake numbers in this chapter come from.', m: 30 },
      { l: 'Video: TCP vs UDP - Explaining Facts and Debunking Myths (Practical Networking)', u: 'https://www.youtube.com/watch?v=jE_FcgpQ7Co', w: 'Twenty minutes that kill the "UDP is just faster" answer and replace it with what each protocol actually promises. Worth it for the myths section alone.', m: 20 },
      { l: 'Evolution of HTTP (MDN)', u: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Evolution_of_HTTP', w: 'The primary reference on how HTTP got from 0.9 to 3, written by the people who document the protocol, and precise about what each version fixed.', m: 20 },
      { l: 'Video: HTTP/1 to HTTP/2 to HTTP/3 (ByteByteGo)', u: 'https://www.youtube.com/watch?v=a-sBfyiXysI', w: 'Four minutes with the diagrams that make multiplexing and head-of-line blocking obvious. Watch it before reading the MDN page, not after.', m: 4 },
      { l: 'What happens in a TLS handshake? (Cloudflare)', u: 'https://www.cloudflare.com/learning/ssl/what-happens-in-a-tls-handshake/', w: 'Step by step through the handshake with the round trips counted, including what changed in TLS 1.3 - the source for the handshake costs quoted here.', m: 12 },
      { l: 'Video: Everything You Need to Know About DNS (ByteByteGo)', u: 'https://www.youtube.com/watch?v=27r4Bzuj5NQ', w: 'Six minutes covering the walk from root to authoritative server and where caching happens, which is the whole mechanism in one picture.', m: 6 },
      { l: 'High Performance Browser Networking: Primer on Latency and Bandwidth', u: 'https://hpbn.co/primer-on-latency-and-bandwidth/', w: 'The speed-of-light arithmetic and the New York to London and New York to Sydney figures used in this chapter, with the table they come from.', m: 20 }
    ],
    glossary: [
      {
        g: 'How networks work',
        sub: '',
        rows: [
          ['Layer', 'One level of the network stack, using the level below it and hiding its detail', 'the layer model'],
          ['Layer 3 (network)', 'Moves packets between IP addresses; sees addresses and nothing else', 'the layer model'],
          ['Layer 4 (transport)', 'An address and a port, as a TCP connection or UDP datagrams; the content is opaque', 'load balancing, transport'],
          ['Layer 7 (application)', 'The message itself - method, path, headers, body; requires terminating TLS to read', 'load balancing, proxies'],
          ['OSI reference model', 'The seven-layer teaching diagram the numbers come from; nobody implements it literally', 'the layer model'],
          ['Round-trip time', 'Time for a message to reach the other side and the answer to return; the unit of network cost', 'latency budgets'],
          ['Head-of-line blocking', 'One slow or lost item holding up everything queued behind it on the same channel', 'TCP, HTTP versions'],
          ['QUIC', 'A transport on UDP that recovers each stream separately; HTTP/3 runs on it', 'HTTP versions'],
          ['Slow start', 'A new TCP connection begins with a small window and ramps up, so it is slower at first', 'connection reuse'],
          ['TLS termination', 'Where the encrypted connection ends and the request becomes readable, usually at an edge', 'TLS, layer 7 routing'],
          ['Session resumption', 'Re-using an earlier TLS handshake so a returning client skips most of it', 'TLS'],
          ['Time to live', 'How long a DNS answer may be cached; the trade between fast change and few lookups', 'DNS'],
          ['Recursive resolver', 'The server that walks from root to authoritative on your behalf and caches the result', 'DNS'],
          ['Keep-alive', 'Leaving a connection open so the next request skips the handshakes', 'latency budgets'],
          ['Propagation delay', 'Latency from distance alone; about 200,000 km a second in fibre and irreducible', 'latency budgets']
        ]
      }
    ]
  };
}(typeof window !== 'undefined' ? window : this));
