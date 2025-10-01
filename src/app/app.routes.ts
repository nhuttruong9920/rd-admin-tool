import { Routes } from '@angular/router';
import { AuthGuard } from '@core/auth/guards/auth.guard';
import { ReturnGuard } from '@core/auth/guards/return.guard';

import { LayoutComponent } from '@core/layout/layout.component';
import { VehicleDetailService } from '@features/vehicle-detail/vehicle-detail.service';
import {
  ConnectionStore,
  DeviceStore,
  GatewayServerStore,
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
        component: createWrapperComponent([
          ConnectionStore,
          DeviceStore,
          VehicleDetailService,
        ]),
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
          {
            path: 'vehicle-detail',
            loadComponent: () =>
              import('./features/vehicle-detail/vehicle-detail.component').then(
                (m) => m.VehicleDetailComponent,
              ),
            title: 'Chi tiết xe',
          },
          {
            path: 'vehicle-detail/:id',
            loadComponent: () =>
              import(
                './features/vehicle-detail/detail-page/detail-page.component'
              ).then((m) => m.DetailPageComponent),
            title: 'Chi tiết xe',
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
            title: 'Gateway Server',
          },
          {
            path: 'gateway-server/create',
            loadComponent: () =>
              import(
                './features/gateway-server/gateway-server-create-update/gateway-server-create-update.component'
              ).then((m) => m.GatewayServerCreateUpdateComponent),
            title: 'Tạo Gateway Server',
          },
          {
            path: 'gateway-server/:id/update',
            loadComponent: () =>
              import(
                './features/gateway-server/gateway-server-create-update/gateway-server-create-update.component'
              ).then((m) => m.GatewayServerCreateUpdateComponent),
            title: 'Cập nhật Gateway Server',
          },
          {
            path: 'reverse-proxy',
            loadComponent: () =>
              import('./features/reverse-proxy/reverse-proxy.component').then(
                (m) => m.ReverseProxyComponent,
              ),
            title: 'Reverse Proxy',
          },
          {
            path: 'reverse-proxy/create',
            loadComponent: () =>
              import(
                './features/reverse-proxy/reverse-proxy-create-update/reverse-proxy-create-update.component'
              ).then((m) => m.ReverseProxyCreateUpdateComponent),
            title: 'Tạo Reverse Proxy',
          },
          {
            path: 'reverse-proxy/:id/update',
            loadComponent: () =>
              import(
                './features/reverse-proxy/reverse-proxy-create-update/reverse-proxy-create-update.component'
              ).then((m) => m.ReverseProxyCreateUpdateComponent),
            title: 'Cập nhật Reverse Proxy',
          },
          {
            path: 'reverse-proxy/config',
            loadComponent: () =>
              import(
                './features/reverse-proxy/reverse-proxy-config/reverse-proxy-config.component'
              ).then((m) => m.ReverseProxyConfigComponent),
            title: 'Cấu hình Reverse Proxy',
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
            path: 'key-management',
            loadComponent: () =>
              import('./features/key-management/key-management.component').then(
                (m) => m.KeyManagementComponent,
              ),
            title: 'Quản lý key',
          },
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
