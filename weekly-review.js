// Local calendar dates avoid UTC offsets changing the review week.
function localDate(value) {
 const [y,m,d]=value.split('-').map(Number);
 return new Date(y,m-1,d,12);
}
function dateKey(date) {
 return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
}
export function previousReviewPeriod(today) {
 const date=localDate(today),day=date.getDay();
 date.setDate(date.getDate()-(day===0?6:day-1));
 date.setDate(date.getDate()-1);
 const end=dateKey(date);
 date.setDate(date.getDate()-6);
 return {start:dateKey(date),end};
}
export function countWritingDays(daily,journals,period) {
 const dates=new Set();
 const add=date=>{if(date>=period.start&&date<=period.end)dates.add(date)};
 daily.forEach(row=>{if(row.done&&row.done.men)add(row.entry_date)});
 journals.forEach(row=>{if(row.closed)add(row.entry_date)});
 return dates.size;
}
