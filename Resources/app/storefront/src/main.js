import AvataxAddressValidator from './checkout-confirm';

const PluginManager = window.PluginManager;
PluginManager.register(
  'AvataxAddressValidator',
  AvataxAddressValidator,
  '[avatax-address-validator]'
);
