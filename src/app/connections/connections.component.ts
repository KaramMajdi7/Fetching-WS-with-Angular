import { Component, OnInit } from '@angular/core';
import { WebsocketService } from '../websocket.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NameDialogComponent } from '../name-dialog/name-dialog.component';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-connections',
  templateUrl: './connections.component.html',
  styleUrls: ['./connections.component.css'],
})
export class ConnectionsComponent implements OnInit {

  messages: { [room: string]: { sender: string; message: string }[] } = {};
  productForm!: FormGroup;
  name!: string;
  isHereTyping: any[] = [];
  typingName: string = '';
  typingRoom!: any; 
  items!: MenuItem[];
  rooms: any[] = []; 
  active!: any; 
  bool: boolean = false;

  constructor(private dialog: MatDialog, private formBuilder: FormBuilder, private websocketService: WebsocketService) {
    this.productForm = this.formBuilder.group({
      message: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.openNameDialog();

    this.items = [
      {label:'Home', routerLink: '/', icon: 'pi pi-home'},
      {label:'Connections', routerLink: '/connections'},
    ];

    this.rooms = [ 
      { 
          label: 'TypeScript', 
          queryParams: { room: 'TypeScript', bool: false },
          command: (event: any) => {
            this.active = this.rooms[0]; 
            this.bool = this.rooms[0].queryParams.bool;
            console.log(this.active.label);
            console.log(this.bool);
          },
      }, 
      { 
          label: 'NestJS', 
          queryParams: { room: 'NestJS', bool: false },
          command: (event: any) => {
            this.active = this.rooms[1]; 
            this.bool = this.rooms[1].queryParams.bool;
            console.log(this.active.label);
            console.log(this.bool);
          },
      }, 
    ]; 
    this.active = this.rooms[0];

      // this.messages.push({ [data.room]: [data.message]});
    this.websocketService.findAllMessages().subscribe((data: any) => {
      console.log(this.messages);

      if (!this.messages[data.room]) {
        this.messages[data.room] = [];
      }
  
      const formattedMessage = { sender: data.name, message: data.message };
      this.messages[data.room].push(formattedMessage);
  
      console.log(this.messages);

    })

    this.websocketService.socket.on('joinedRoom', (data: any) => {
      console.log(`Room on client: ${data}`);
    })

    this.websocketService.socket.on('typing', (data: any) => {
      if(data.typingInst.isTyping){
        this.isHereTyping[data.typingInst.room] = true;
        this.typingRoom = data.typingInst.room;
        this.typingName = data.name;
        console.log(this.typingName);
        console.log(this.isHereTyping);
        console.log(this.isHereTyping[data.typingInst.room]);
      } else {
        this.isHereTyping[data.typingInst.room] = false;
        this.typingName = '';
        this.typingRoom = '';
      }
    })
  }

  openNameDialog(): void {
    const dialogRef = this.dialog.open(NameDialogComponent, {
      width: '300px',
      data: { name: '' },
    });
    
    dialogRef.afterClosed().subscribe((result) => {
      this.name = result;
      this.websocketService.socket.emit('join', { name: this.name })
      if (result) {
        console.log('User entered name:', result);
      } else {
        console.log('User canceled');
      }
    });
  }

  onSubmit() {
    this.websocketService.createMessage({ name: this.name, message: this.productForm.value.message, room: this.active.label });
    this.productForm.reset();
  }

  onFocus() {
    let timeout;
    this.websocketService.socket.emit('typing', { typingInst: { isTyping: true, room: this.active.label } });
    setTimeout(() => {
      this.websocketService.socket.emit('typing', { typingInst: { isTyping: false, room: this.active.label } });
    }, 3000);
  }

  onBlur() {
    this.websocketService.socket.emit('typing', { typingInst: { isTyping: false, room: this.active.label } });
  }

  toggleJoining() {
    console.log(`Room from component: ${this.active.label}`);
    if(this.bool){
      this.websocketService.leaveRoom(this.active.label);
      this.active.queryParams.bool = false;
      this.bool = false;
    } else {
      this.websocketService.joinRoom(this.active.label);
      this.active.queryParams.bool = true;
      this.bool = true;
    }
  }

}
