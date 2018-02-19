import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { DateTime } from 'ionic-angular/components/datetime/datetime';


@Component({
  selector: 'shared',
  template:''
})
export class Track {
title:string;
link:string;
src: string;
duration: number;
end: string;
start: string;
now:string; 
manager:string;
position: number;
//positionpercent:number;
comments:Comment[];
timespan:string;
even:boolean;
isPlaying: boolean=false;
  constructor(title:string=null,src: string=null,duration: number=null,link:string=null,manager:string=null,timespan:string=null,even:boolean=false) {
    this.title = title;
    this.link = link;
    this.src = src;
    this.duration = duration;
    this.end ="";
    this.start ="0:00";
    this.manager= manager;
    this.comments=[];
    this.even=even;
    //this.positionpercent =  this.position/this.duration*100;
  };
  get positionpercent(){
    return this.position/this.duration*100;
  } 
  
  
}

export class TrackResult {
  total:number;
  tracks:Track[] = [];
  pagesize:number;
  pages:number[] = [];
  page:number;
  constructor(pagesize:number=null,page:number=null) {
    if(page==null)
      page=1;
    if(pagesize==null)
      pagesize=7;
    
    this.pagesize=pagesize;
    this.page= page;
     };
   }

   export class Comment {
    username:string;
    text:string;
    img:string;
    timespan:string;
    replies:Comment[];
    constructor(username:string=null,text:string=null,img:string=null,timespan:string=null,replies:Comment[]=[]) {
      this.username = username;
      this.text= text;
      this.img=img;
      this.timespan=timespan;
      this.replies= replies;
       };
     }
  
   export function getposition(secs:number):string{
  let res ='';
  let totalSeconds = secs;
  let hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  let minutes = pad(Math.floor(totalSeconds / 60));
  let seconds = pad(Math.floor(totalSeconds % 60));
  if(hours > 0)
    res+=pad(hours) + ":";
    res +=  minutes.toString()+":" + seconds.toString();
    return res;
}
export function pad(number:number):string{
  return (number < 10 ? '0' : '') + number
}


export function geturlencoded(obj :any):string{
  var str = [];
    for (var key in obj) {
         if (obj.hasOwnProperty(key)) {
               str.push(encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]))                  
               console.log(key + " -> " + obj[key]);
         }
    }
    return str.join("&");
}