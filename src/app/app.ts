import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingSpinner } from './shared/components/loading-spinner/loading-spinner';
import { MainLayout } from './layout/main-layout/main-layout';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoadingSpinner, MainLayout],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('eTracker');
}
