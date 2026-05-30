function createMetricsCollector() {
  let connectionsTotal = 0;
  let connectionsActive = 0;
  let bytesRx = 0;
  let bytesTx = 0;
  let messagesProcessed = 0;

  function incrementConnections() {
    connectionsTotal++;
    connectionsActive++;
  }

  function decrementConnections() {
    connectionsActive = Math.max(0, connectionsActive - 1);
  }

  function addBytesRx(n) {
    bytesRx += n;
  }

  function addBytesTx(n) {
    bytesTx += n;
  }

  function incrementMessages() {
    messagesProcessed++;
  }

  function getSnapshot() {
    return {
      connections_total: connectionsTotal,
      connections_active: connectionsActive,
      bytes_received: bytesRx,
      bytes_transmitted: bytesTx,
      messages_processed: messagesProcessed,
    };
  }

  function getTotalBytes() {
    return bytesRx + bytesTx;
  }

  function reset() {
    connectionsTotal = 0;
    bytesRx = 0;
    bytesTx = 0;
    messagesProcessed = 0;
  }

  return {
    incrementConnections,
    decrementConnections,
    addBytesRx,
    addBytesTx,
    incrementMessages,
    getSnapshot,
    getTotalBytes,
    reset,
  };
}

module.exports = { createMetricsCollector };
