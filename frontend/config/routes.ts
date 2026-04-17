export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user/login',
        layout: false,
        name: 'login',
        component: './user/login',
      },
      {
        path: '/user',
        redirect: '/user/login',
      },
      {
        path: '/user/:path*',
        layout: false,
        component: './404',
      },
    ],
  },
  {
    path: '/workbench',
    name: 'workbench',
    icon: 'dashboard',
    routes: [
      {
        path: '/workbench',
        redirect: '/workbench/launchpad',
      },
      {
        name: 'launchpad',
        icon: 'rocket',
        path: '/workbench/launchpad',
        component: './workbench/launchpad',
      },
      {
        name: 'todo',
        icon: 'smile',
        path: '/workbench/todo',
        component: './workbench/todo',
      },
      {
        name: 'done',
        icon: 'smile',
        path: '/workbench/done',
        component: './workbench/done',
      },
      {
        name: 'own',
        icon: 'smile',
        path: '/workbench/own',
        component: './workbench/own',
      },
      {
        name: 'adhoc',
        icon: 'form',
        path: '/workbench/adhoc',
        component: './workbench/adhoc',
      },
    ],
  },
  {
    path: '/modeler',
    name: 'modeler',
    icon: 'form',
    routes: [
      {
        path: '/modeler',
        redirect: '/modeler/bpmn',
      },
      {
        path: '/modeler/bpmn',
        name: 'bpmn',
        component: './modeler/bpmn',
      },
      {
        path: '/modeler/forms',
        name: 'forms',
        component: './modeler/forms',
      },
    ],
  },
  {
    path: '/engine',
    name: 'engine',
    icon: 'table',
    routes: [
      {
        path: '/engine',
        redirect: '/engine/definitions',
      },
      {
        path: '/engine/definitions',
        name: 'definitions',
        component: './engine/definitions',
      },
      {
        path: '/engine/deployments',
        name: 'deployments',
        component: './engine/deployments',
      },
    ],
  },
  {
    path: '/monitor',
    name: 'monitor',
    icon: 'monitor',
    routes: [
      {
        path: '/monitor',
        redirect: '/monitor/instances',
      },
      {
        path: '/monitor/instances',
        name: 'instances',
        component: './monitor/instances',
      },
      {
        path: '/monitor/incidents',
        name: 'incidents',
        component: './monitor/incidents',
      },
    ],
  },
  // {
  //   path: '/org',
  //   name: 'org',
  //   icon: 'user',
  //   component: './org',
  // },
  {
    path: '/analytics',
    name: 'analytics',
    icon: 'profile',
    routes: [
      {
        path: '/analytics',
        redirect: '/analytics/dashboard',
      },
      {
        path: '/analytics/dashboard',
        name: 'dashboard',
        component: './analytics/dashboard',
      },
    ],
  },
  // {
  //   path: '/chatbot',
  //   name: 'chatbot',
  //   icon: 'robot',
  //   component: './chatbot',
  // },
  {
    path: '/',
    redirect: '/workbench/todo',
  },
  {
    path: '/:path*',
    layout: false,
    component: './404',
  },
];
