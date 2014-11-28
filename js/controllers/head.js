'use strict';

angular.module('copayApp.controllers').controller('HeadController', function($scope, $rootScope, $filter, $timeout, notification, controllerUtils) {
  $scope.username = $rootScope.iden.getName();
  $scope.hoverMenu = false;

  $scope.hoverIn = function() {
    this.hoverMenu = true;
  };

  $scope.hoverOut = function() {
    this.hoverMenu = false;
  };

  $scope.signout = function() {
    $rootScope.signingOut = true;
    controllerUtils.logout();
  };

  $scope.refresh = function() {
    var w = $rootScope.wallet;
    if (!w) return;

    if (w.isReady()) {
      w.sendWalletReady();
      if ($rootScope.addrInfos.length > 0) {
        controllerUtils.clearBalanceCache(w);
        controllerUtils.updateBalance(w, function() {
          $rootScope.$digest();
        });
      }
    }
  };

  // Ensures a graceful disconnect
  window.onbeforeunload = function() {
    $scope.signout();
  };

  $scope.$on('$destroy', function() {
    window.onbeforeunload = undefined;
  });

  if ($rootScope.wallet) {
    $scope.$on('$idleStart', function() {
    });
    $scope.$on('$idleWarn', function(a, countdown) {
      $rootScope.countdown = countdown;
      $rootScope.sessionExpired = true;
    });
    $scope.$on('$idleEnd', function() {
      $timeout(function() {
        $rootScope.sessionExpired = null;
      }, 500);
    });
    $scope.$on('$idleTimeout', function() {
      $rootScope.sessionExpired = null;
      $scope.signout();
      notification.warning('Session closed', 'Session closed because a long time of inactivity');
    });
    $scope.$on('$keepalive', function() {
      if ($rootScope.wallet) {
        $rootScope.wallet.keepAlive();
      }
    });
    $rootScope.$watch('title', function(newTitle, oldTitle) {
      $scope.title = newTitle;
    });
    $rootScope.$on('signout', function() {
      $scope.signout();
    });
  }
});