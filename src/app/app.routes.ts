import { Routes } from '@angular/router';

import { LayoutComponent } from '@core/layout/layout.component';
import { DeviceStore, HistoryStore, ReverseProxyStore } from '@shared/stores';
import { createWrapperComponent } from '@shared/utils';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'monitor/all-vehicles',
        pathMatch: 'full',
      },
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
            path: 'send-command',
            loadComponent: () =>
              import('./features/send-command/send-command.component').then(
                (m) => m.SendCommandComponent,
              ),
            title: 'Gửi lệnh',
          },
        ],
      },
      {
        path: 'reverse-proxy',
        component: createWrapperComponent([ReverseProxyStore]),
        children: [
          {
            path: 'reverse-proxy',
            loadComponent: () =>
              import('./features/reverse-proxy/reverse-proxy.component').then(
                (m) => m.ReverseProxyComponent,
              ),
          },
          {
            path: 'create',
            loadComponent: () =>
              import(
                './features/reverse-proxy-create-update/reverse-proxy-create-update.component'
              ).then((m) => m.ReverseProxyCreateUpdateComponent),
          },
          {
            path: ':id/update',
            loadComponent: () =>
              import(
                './features/reverse-proxy-create-update/reverse-proxy-create-update.component'
              ).then((m) => m.ReverseProxyCreateUpdateComponent),
          },
          {
            path: 'config',
            loadComponent: () =>
              import(
                './features/reverse-proxy-config/reverse-proxy-config.component'
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
    ],
  },
];
