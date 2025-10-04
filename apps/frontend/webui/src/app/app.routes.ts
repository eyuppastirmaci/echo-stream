import { Routes } from '@angular/router';
import { LandingPage, RegisterPage } from './features/user';
import { ChatPage } from './features/chat';

export const routes: Routes = [
  {
    path: '',
    component: LandingPage,
    title: 'EchoStream - Real-time Chat Platform'
  },
  {
    path: 'register',
    component: RegisterPage,
    title: 'Register - EchoStream'
  },
  {
    path: 'login',
    component: RegisterPage, // TODO: use a dedicated LoginPage component later instead of RegisterPage
    title: 'Login - EchoStream'
  },
  {
    path: 'chat',
    component: ChatPage,
    title: 'Chat - EchoStream'
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
