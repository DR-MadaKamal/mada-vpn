import asyncio
import sys

LISTEN_HOST = "0.0.0.0"
LISTEN_PORT = 8080

HEALTH_RESPONSE = b"HTTP/1.1 200 OK\r\nContent-Length: 16\r\nContent-Type: text/plain\r\n\r\nproxy-health-ok\n"


async def relay(reader, writer):
    try:
        while True:
            data = await asyncio.wait_for(reader.read(65536), timeout=300)
            if not data:
                break
            writer.write(data)
            await writer.drain()
    except (asyncio.TimeoutError, ConnectionResetError, BrokenPipeError, asyncio.CancelledError):
        pass


async def tunnel(reader, writer):
    try:
        data = await reader.readuntil(b"\r\n\r\n")
    except (asyncio.IncompleteReadError, ValueError):
        writer.write(HEALTH_RESPONSE)
        await writer.drain()
        writer.close()
        return

    try:
        first_line = data.split(b"\r\n")[0].decode()
        parts = first_line.split()
    except (IndexError, ValueError, UnicodeDecodeError):
        writer.write(HEALTH_RESPONSE)
        await writer.drain()
        writer.close()
        return

    if len(parts) < 2 or parts[0].upper() != "CONNECT":
        writer.write(HEALTH_RESPONSE)
        await writer.drain()
        writer.close()
        return

    target = parts[1]
    try:
        host, port_str = target.rsplit(":", 1)
        port = int(port_str)
    except (ValueError, IndexError):
        writer.write(b"HTTP/1.1 400 Bad Request\r\n\r\n")
        await writer.drain()
        writer.close()
        return

    try:
        remote_reader, remote_writer = await asyncio.wait_for(
            asyncio.open_connection(host, port), timeout=10
        )
    except Exception:
        writer.write(b"HTTP/1.1 502 Bad Gateway\r\n\r\n")
        await writer.drain()
        writer.close()
        return

    writer.write(b"HTTP/1.1 200 Connection Established\r\n\r\n")
    await writer.drain()

    done, pending = await asyncio.wait(
        [
            asyncio.create_task(relay(reader, remote_writer)),
            asyncio.create_task(relay(remote_reader, writer)),
        ],
        return_when=asyncio.FIRST_COMPLETED,
    )
    for task in pending:
        task.cancel()
    for task in done:
        try:
            task.result()
        except (ConnectionResetError, BrokenPipeError, asyncio.CancelledError):
            pass
    try:
        remote_writer.close()
    except Exception:
        pass
    try:
        writer.close()
    except Exception:
        pass


async def main():
    server = await asyncio.start_server(tunnel, LISTEN_HOST, LISTEN_PORT)
    addrs = ", ".join(
        str(s.getsockname()[0]) + ":" + str(s.getsockname()[1])
        for s in server.sockets
    )
    print(f"Proxy listening on {addrs}", flush=True)
    async with server:
        await server.serve_forever()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Shutting down...", flush=True)
        sys.exit(0)
