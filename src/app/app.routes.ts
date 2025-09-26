import { Routes } from '@angular/router';
import { AuthGuard } from '@core/auth/guards/auth.guard';
import { ReturnGuard } from '@core/auth/guards/return.guard';

import { LayoutComponent } from '@core/layout/layout.component';
import {
  DeviceStore,
  GatewayServerStore,
  HistoryStore,
  ReverseProxyStore,
} from '@shared/stores';
import { createWrapperComponent } from '@shared/utils';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [ReturnGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('@core/auth/pages/login/login.component').then(
            (m) => m.LoginComponent,
          ),
      },
    ],
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'monitor',
        component: createWrapperComponent([DeviceStore, HistoryStore]),
        children: [
          {
            path: 'all-vehicles',
            loadComponent: () =>
              import('./features/all-vehicles/all-vehicles.component').then(
                (m) => m.AllVehiclesComponent,
              ),
            title: 'Giám sát',
          },
          {
            path: 'history-replay',
            loadComponent: () =>
              import('./features/history-replay/history-replay.component').then(
                (m) => m.HistoryReplayComponent,
              ),
            title: 'Xem lại lộ trình',
          },
          {
            path: 'command',
            loadComponent: () =>
              import('./features/command/command.component').then(
                (m) => m.CommandComponent,
              ),
            title: 'Gửi lệnh',
          },
        ],
      },
      {
        path: 'network',
        component: createWrapperComponent([
          ReverseProxyStore,
          GatewayServerStore,
        ]),
        children: [
          {
            path: 'gateway-server',
            loadComponent: () =>
              import('./features/gateway-server/gateway-server.component').then(
                (m) => m.GatewayServerComponent,
              ),
          },
          {
            path: 'gateway-server/create',
            loadComponent: () =>
              import(
                './features/gateway-server/gateway-server-create-update/gateway-server-create-update.component'
              ).then((m) => m.GatewayServerCreateUpdateComponent),
          },
          {
            path: 'gateway-server/:id/update',
            loadComponent: () =>
              import(
                './features/gateway-server/gateway-server-create-update/gateway-server-create-update.component'
              ).then((m) => m.GatewayServerCreateUpdateComponent),
          },
          {
            path: 'reverse-proxy',
            loadComponent: () =>
              import('./features/reverse-proxy/reverse-proxy.component').then(
                (m) => m.ReverseProxyComponent,
              ),
          },
          {
            path: 'reverse-proxy/create',
            loadComponent: () =>
              import(
                './features/reverse-proxy/reverse-proxy-create-update/reverse-proxy-create-update.component'
              ).then((m) => m.ReverseProxyCreateUpdateComponent),
          },
          {
            path: 'reverse-proxy/:id/update',
            loadComponent: () =>
              import(
                './features/reverse-proxy/reverse-proxy-create-update/reverse-proxy-create-update.component'
              ).then((m) => m.ReverseProxyCreateUpdateComponent),
          },
          {
            path: 'reverse-proxy/config',
            loadComponent: () =>
              import(
                './features/reverse-proxy/reverse-proxy-config/reverse-proxy-config.component'
              ).then((m) => m.ReverseProxyConfigComponent),
          },
          {
            path: 'traffic',
            loadComponent: () =>
              import('./features/traffic/traffic.component').then(
                (m) => m.TrafficComponent,
              ),
            title: 'Traffic',
          },
        ],
      },
      {
        path: 'others',
        children: [
          {
            path: 'chatbot',
            loadComponent: () =>
              import('./features/chatbot/chatbot.component').then(
                (m) => m.ChatbotComponent,
              ),
            title: 'Chatbot',
          },
        ],
      },
      {
        path: '**',
        redirectTo: 'monitor/all-vehicles',
      },
    ],
  },
];
