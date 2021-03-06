'use strict';

var path = require('path');

function registerModuleWrapper(moduleManager, module) {
  return function() {
    return moduleManager.manager.registerModule(module, true);
  };
}

/**
 * Configure the AwesomeModuleManager by adding states and modules into the Meetings application.
 * @param {object} moduleManager
 * @return {object} promise
 */
module.exports = function setupServer(moduleManager) {
  var modulesPath = path.normalize(
    path.join(__dirname, '../../modules')
  );

  moduleManager.manager.registerState('deploy', ['lib']);
  moduleManager.manager.registerState('start', ['lib', 'deploy']);

  moduleManager.setupManager();

  var trustedModulesLoader = moduleManager.manager.loaders.filesystem(modulesPath, true);
  moduleManager.manager.appendLoader(trustedModulesLoader);

  return moduleManager.manager.load('linagora.io.meetings.core.conference')
    .then(moduleManager.manager.load('linagora.io.meetings.core.esn-config'))
    .then(registerModuleWrapper(moduleManager, require('../webserver').WebServer))
    .then(registerModuleWrapper(moduleManager, require('../webserver/webserver-wrapper')))
    .then(registerModuleWrapper(moduleManager, require('../core/analytics-piwik')))
    .then(registerModuleWrapper(moduleManager, require('../core/analytics-google')))
    .then(registerModuleWrapper(moduleManager, require('linagora.esn.websocket-server')))
    .then(registerModuleWrapper(moduleManager, require('linagora.esn.webrtc')))
    .then(registerModuleWrapper(moduleManager, require('../wsserver').WsServer))
    .then(registerModuleWrapper(moduleManager, require('linagora.esn.mailer')))
    .then(registerModuleWrapper(moduleManager, require('linagora.esn.conference.invitation')))
    .then(registerModuleWrapper(moduleManager, require('../').Meetings));
};
