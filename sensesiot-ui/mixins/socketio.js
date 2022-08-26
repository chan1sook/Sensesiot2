import socketio from 'socket.io-client'

const socket = socketio('/', {
  path: '/api/socket.io/',
})
export default {
  data() {
    return {
      socketio: socket,
    }
  },
  mounted() {
    socket.on('connect', () => {
      console.log('Websocket Connect!')
    })
  },
  beforeDestroy() {},
}
