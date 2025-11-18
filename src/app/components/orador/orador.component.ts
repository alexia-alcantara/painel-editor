import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-orador',
  standalone: true,
  templateUrl: './orador.component.html',
  styleUrls: ['./orador.component.css']
})
export class OradorComponent implements OnInit {
  @Input() dados: any; 
  @Input() props: any;

  constructor() { }

  ngOnInit() {
  }

}
