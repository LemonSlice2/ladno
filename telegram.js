(() => {
  'use strict';
  const tg=window.Telegram?.WebApp;
  const active=!!(tg&&tg.platform&&tg.platform!=='unknown');
  const api=()=>window.LadnoMiniApp;
  const safeCall=(fn,...args)=>{try{return fn?.(...args);}catch(error){return undefined;}};
  let dirty=false,lastPage='home';
  function insets(){
    const root=document.documentElement.style;
    for(const side of ['top','right','bottom','left']){
      const physical=Math.max(0,Number(tg?.safeAreaInset?.[side])||0);
      const content=Math.max(0,Number(tg?.contentSafeAreaInset?.[side])||0);
      root.setProperty('--mini-safe-'+side,(physical+content)+'px');
    }
    const visible=Number(tg?.viewportHeight)||window.innerHeight;
    root.setProperty('--mini-height',visible+'px');
    window.LadnoMiniApp?.refreshViewport();
  }
  function theme(){
    const dark=active&&tg.colorScheme==='dark';
    document.documentElement.classList.toggle('telegram-dark',dark);
    const bg=dark?'#24231e':'#f7ecd8',bottom=dark?'#302e27':'#fff3df';
    safeCall(tg?.setHeaderColor?.bind(tg),bg);
    safeCall(tg?.setBackgroundColor?.bind(tg),bg);
    if(tg?.isVersionAtLeast?.('7.10'))safeCall(tg?.setBottomBarColor?.bind(tg),bottom);
  }
  function sync(state){
    if(!active)return;
    if(!state.modalOpen)dirty=false;
    if(state.page!==lastPage){safeCall(tg.HapticFeedback?.selectionChanged?.bind(tg.HapticFeedback));lastPage=state.page;}
    if(state.modalOpen||state.page!=='home')safeCall(tg.BackButton?.show?.bind(tg.BackButton));
    else safeCall(tg.BackButton?.hide?.bind(tg.BackButton));
    if(dirty)safeCall(tg.enableClosingConfirmation?.bind(tg));
    else safeCall(tg.disableClosingConfirmation?.bind(tg));
  }
  function back(){
    const perform=()=>api()?.back();
    if(dirty&&api()?.state().modalOpen&&tg?.showConfirm){tg.showConfirm('Закрыть форму без сохранения?',confirmed=>{if(confirmed)perform();});return;}
    perform();
  }
  window.LadnoTelegram={sync,refresh:insets,active};
  const note=document.getElementById('miniStatus');
  if(!active){if(note)note.textContent='Предпросмотр Telegram-версии · данные сохраняются только в этом браузере.';return;}
  document.documentElement.classList.add('telegram-app');
  if(note)note.textContent='Локальный бюджет на этом устройстве · без синхронизации.';
  theme();insets();
  safeCall(tg.ready?.bind(tg));safeCall(tg.expand?.bind(tg));
  safeCall(tg.BackButton?.onClick?.bind(tg.BackButton),back);
  safeCall(tg.SettingsButton?.onClick?.bind(tg.SettingsButton),()=>api()?.navigate('settings'));
  safeCall(tg.SettingsButton?.show?.bind(tg.SettingsButton));
  for(const event of ['viewportChanged','safeAreaChanged','contentSafeAreaChanged'])safeCall(tg.onEvent?.bind(tg),event,insets);
  safeCall(tg.onEvent?.bind(tg),'themeChanged',theme);
  document.addEventListener('input',event=>{if(event.target.closest?.('#modalForm')){dirty=true;sync(api().state());}});
  document.addEventListener('change',event=>{if(event.target.closest?.('#modalForm')){dirty=true;sync(api().state());}});
  sync(api().state());
})();
