import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-materia',
  standalone: true,
  templateUrl: './materia.component.html',
  styleUrls: ['./materia.component.css']
})
export class MateriaComponent implements OnInit {
  @Input() dados: any; 
  @Input() props: any;

  constructor() { }

  ngOnInit() {
  }

}
