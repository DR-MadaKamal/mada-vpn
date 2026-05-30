FROM golang:1.21-alpine AS builder

RUN apk add --no-cache git

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 go build -o /go-proxy ./cmd/server

FROM alpine:3.19
RUN apk add --no-cache ca-certificates tzdata wireguard-tools iproute2

COPY --from=builder /go-proxy /usr/local/bin/go-proxy
COPY config.yaml /app/config.yaml

EXPOSE 8080 1080 8081 51820

ENTRYPOINT ["go-proxy"]
