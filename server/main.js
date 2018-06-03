import { Meteor } from 'meteor/meteor';
import { JsonRoutes } from 'meteor/simple:json-routes';
import { PushSender } from './imports/cron';
import './imports/methods';

  Meteor.startup(() => {
    JsonRoutes.setResponseHeaders({
      'Cache-Control': 'no-store',
      Pragma: 'no-cache',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    });
    
    if (parseInt(process.env.NODE_APP_INSTANCE) === 0 || true) {
      console.log('Instance ID = 0; Starting Cron');
      const cron = new PushSender();

      Meteor.setInterval(function()  {
        console.log('Cron Pushsender Running at ' + new Date().toISOString());
        cron.start();
      }, 3000);
    }
  });