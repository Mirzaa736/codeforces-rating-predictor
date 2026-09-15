(() => {
'use strict';
function getContestId(){const m=location.pathname.match(/\/contest\/(\d+)\/standings/);return m?Number(m[1]):null}
function extractHandle(row){return row.querySelector('a[href*="/profile/"]')?.textContent?.trim()||null}
function getTable(){return document.querySelector('#standings, table.standings')}
function getHeaderRow(t=getTable()){return t?.querySelector('thead tr')||null}
function findWhoColumnIndex(t=getTable()){const h=getHeaderRow(t);if(!h)return 1;const i=[...h.children].findIndex(x=>/\bwho\b/i.test(x.textContent||''));return i>=0?i:1}
function findWhoCell(row){const a=row.querySelector('a[href*="/profile/"]');return a?.closest('td')||null}
function insertAfterWho(row,node){const c=findWhoCell(row);if(!c)return false;c.insertAdjacentElement('afterend',node);return true}
function insertHeaderAfterWho(node){const h=getHeaderRow();if(!h)return false;const c=h.children[findWhoColumnIndex()];if(!c)return false;c.insertAdjacentElement('afterend',node);return true}
function isVirtualParticipationPage(){return /\/contest\/\d+\/virtual\/?$/i.test(location.pathname)||[...document.querySelectorAll('[class*="contest-state"]')].some(e=>/^virtual\s+participation$/i.test((e.textContent||'').replace(/\s+/g,' ').trim()))}
function getTableRows(){const t=getTable();return t?[...t.querySelectorAll('tbody tr')].filter(extractHandle):[]}
CFPR.DOM={getContestId,extractHandle,getTable,getHeaderRow,findWhoColumnIndex,insertAfterWho,insertHeaderAfterWho,isVirtualParticipationPage,getTableRows,findWhoCell};
})();