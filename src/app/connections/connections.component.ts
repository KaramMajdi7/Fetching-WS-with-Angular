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

  messages: any[] = [];
  productForm!: FormGroup;
  name!: string;
  isHereTyping: boolean = false;
  typingName: string = '';
  items!: MenuItem[];

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


    this.websocketService.findAllMessages().subscribe((data: any) => {
      this.messages.push(data);
      console.log(data);
    })

    this.websocketService.socket.on('typing', (data: any) => {
      console.log(data);
      if(data.isTyping){
        this.isHereTyping = true;
        this.typingName = data.name;
      } else {
        this.isHereTyping = false;
        this.typingName = '';
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
    this.websocketService.createMessage({ name: this.name, message: this.productForm.value.message });
    this.productForm.reset();
  }

  onFocus() {
    let timeout;
    this.websocketService.socket.emit('typing', { isTyping: true });
    setTimeout(() => {
      this.websocketService.socket.emit('typing', { isTyping: false });
    }, 3000);
  }

  onBlur() {
    this.websocketService.socket.emit('typing', { isTyping: false });
  }

}
