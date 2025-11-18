import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-partido',
  standalone: true,
  templateUrl: './partido.component.html',
  styleUrls: ['./partido.component.css']
})
export class PartidoComponent implements OnInit {

  @Input() dados: any; 
  @Input() props: any;
  constructor() { }

  ngOnInit() {
  }

}
