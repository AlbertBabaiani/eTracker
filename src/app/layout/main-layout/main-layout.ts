import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBar } from '../nav-bar/nav-bar';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, NavBar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {}
