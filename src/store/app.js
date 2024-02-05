// Utilities
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    websocketStatus: 'Not connected',
    websocket: null,
    clientId: null,
    cells: [],
    opponentCells: [],
    ready: false,
    gameStatus: 'Not connected',
    myTurn: false,
    gameEnded: false
  }),
  actions: {
    connectToWebsocket() {
      console.log('status', this.websocketStatus);
      if  (this.websocketStatus == 'Connected') {
        return;
      }
      this.websocket = new WebSocket('wss://control.datadreams.fi:8001');

      this.websocket.addEventListener('open', () => {
        this.websocketStatus = 'Connected';
        this.gameStatus = 'Connected';
        console.log('Connected to websocket');
      });

      this.websocket.addEventListener('message', (event) => {
        let data = null;
        try {
          data = JSON.parse(event.data);
        } catch (error){
          console.error(error);
        }
        console.log('message: ', data);
        if (!data) {
          return;
        }
        if (data.action == 'INIT') {
          this.clientId = data.id;
        } else if (data.action == 'UPDATE_CELL') {
          let cell = null;
          if (data.client_id == this.clientId) {
            console.log('My cell updated');
            cell = this.cells.find(cell => cell.id == data.cell.id);
          } else {
            console.log('Opponent cell updated');
            cell = this.opponentCells.find(cell => cell.id == data.cell.id);
          }
          if (cell) {
            cell.isHit = data.cell.isHit;
            cell.isMiss = data.cell.isMiss;
          }
        } else if (data.action == 'GAME_STATUS') {
          this.gameStatus = data.status;
        } else if (data.action == 'GAME_FULL') {
          this.gameStatus = 'Game full';
        } else if (data.action == 'TURN') {
          if (data.client_id == this.clientId) {
            this.myTurn = true;
          }
        }

        if (data.game_ended) {
          this.gameEnded = true;
        }
      });

      this.websocket.addEventListener('close', () => {
        this.websocketStatus = 'Closed';
        console.log('Disconnected from websocket');
        setTimeout(() => {
          console.log(this.websocketStatus);
          this.connectToWebsocket();
        }, 3000);
      });
    },
    shoot(cell) {
      this.myTurn = false;
      let payload = {
        cell: cell,
        client_id: this.clientId,
        action: 'SHOOT'
      };
      this.websocket.send(JSON.stringify(payload));
    },
    updateCells() {
      let payload = {
        cells: this.cells,
        client_id: this.clientId,
        action: 'UPDATE_ALL_CELLS'
      };
      this.websocket.send(JSON.stringify(payload));
    },
    readyUp() {
      this.ready = true;
      let payload = {
        client_id: this.clientId,
        action: 'READY_UP'
      };
      this.websocket.send(JSON.stringify(payload));
    }
  }
})
