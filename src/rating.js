(() => {
  'use strict';
  const C = CFPR.CONSTANTS;
  const MIN = C.MIN_RATING, MAX = C.MAX_RATING, RANGE = MAX - MIN, RATING_OFFSET = -MIN;
  const ELO_OFFSET = RANGE, KERNEL_LEN = 2 * RANGE + 1, DEFAULT = C.DEFAULT_RATING;
  function winProbability(a,b){return 1/(1+Math.pow(10,(b-a)/400))}
  function binarySearch(left,right,predicate){while(left<right){const mid=Math.floor((left+right)/2);if(predicate(mid))right=mid;else left=mid+1}return left}
  class Predictor{
    constructor(participants){this.participants=participants.map(p=>({...p}));this.seed=null;this.adjustment=0}
    calculate(includePerformance=false){this._calculateSeed();this._reassignRanks();for(const p of this.participants)p.delta=this._calcDelta(p,p.effectiveRating);this._adjustDeltas();if(includePerformance)for(const p of this.participants)p.performance=this._calcPerformance(p);return this.participants}
    _calculateSeed(){const counts=new Float64Array(RANGE+1);for(const p of this.participants){let r=Math.round(Number.isFinite(p.effectiveRating)?p.effectiveRating:DEFAULT);r=Math.max(MIN,Math.min(MAX,r));counts[r+RATING_OFFSET]++}const kernel=new Float64Array(KERNEL_LEN);for(let d=-RANGE;d<=RANGE;d++)kernel[d+ELO_OFFSET]=1/(1+Math.pow(10,d/400));const conv=new CFPR.FFT(Math.max(kernel.length+counts.length-1,2));this.seed=conv.convolve(kernel,counts);this.kernel=kernel}
    _baseSeed(rating){rating=Math.max(MIN,Math.min(MAX,rating));const index=rating+ELO_OFFSET+RATING_OFFSET;return 1+(this.seed[index]||0)}
    _getSeed(rating,excludedRating){const base=this._baseSeed(Math.round(rating));const diff=Math.round(rating-excludedRating);return diff<-RANGE||diff>RANGE?base:base-this.kernel[diff+ELO_OFFSET]}
    _reassignRanks(){const all=this.participants.every(p=>Number.isFinite(p.inputRank));if(all){for(const p of this.participants)p.rank=p.inputRank;return}this.participants.sort((a,b)=>b.points-a.points||a.penalty-b.penalty||String(a.handle).localeCompare(String(b.handle)));let lp=null,le=null,rank=0;for(let i=0;i<this.participants.length;i++){const p=this.participants[i];if(p.points!==lp||p.penalty!==le){rank=i+1;lp=p.points;le=p.penalty}p.rank=rank}}
    _rankToRating(targetRank,selfRating){return binarySearch(2,MAX,r=>this._getSeed(r,selfRating)<targetRank)-1}
    _calcDelta(p,assumed){const seed=this._getSeed(assumed,p.effectiveRating);const midpoint=Math.sqrt(Math.max(1,p.rank*seed));const needed=this._rankToRating(midpoint,p.effectiveRating);return Math.trunc((needed-assumed)/2)}
    _adjustDeltas(){this.participants.sort((a,b)=>b.effectiveRating-a.effectiveRating);const n=this.participants.length;if(!n)return;let sum=this.participants.reduce((s,p)=>s+p.delta,0);const first=Math.trunc(-sum/n)-1;this.adjustment=first;for(const p of this.participants)p.delta+=first;const count=Math.min(4*Math.round(Math.sqrt(n)),n);sum=0;for(let i=0;i<count;i++)sum+=this.participants[i].delta;const second=Math.min(Math.max(Math.trunc(-sum/count),-10),0);this.adjustment+=second;for(const p of this.participants)p.delta+=second}
    _calcPerformance(p){if(p.rank===1)return Infinity;return binarySearch(-500,MAX,assumed=>this._calcDelta(p,assumed)+this.adjustment<=0)}
  }
  function normalizeParticipant(row){const rating=Number.isFinite(row.rating)?Math.round(row.rating):null;return{handle:row.handle,points:Number(row.points)||0,penalty:Number(row.penalty)||0,rating,effectiveRating:rating==null?DEFAULT:rating,officialRank:Number.isFinite(row.rank)?row.rank:null,inputRank:Number.isFinite(row.rank)?row.rank:null,delta:null,performance:null}}
  function predict(rows,includePerformance=true){const contestants=rows.map(normalizeParticipant);if(!contestants.length)return[];return new Predictor(contestants).calculate(includePerformance)}
  function ratingTier(rating){if(rating==null)return{name:'Unrated',color:''};if(rating<1200)return{name:'Newbie',color:'gray'};if(rating<1400)return{name:'Pupil',color:'green'};if(rating<1600)return{name:'Specialist',color:'cyan'};if(rating<1900)return{name:'Expert',color:'blue'};if(rating<2100)return{name:'Candidate Master',color:'violet'};if(rating<2300)return{name:'Master',color:'orange'};if(rating<2400)return{name:'International Master',color:'orange'};if(rating<2600)return{name:'Grandmaster',color:'red'};if(rating<3000)return{name:'International Grandmaster',color:'red'};return{name:'Legendary Grandmaster',color:'legendary'}}
  CFPR.Rating={Predictor,predict,ratingTier,winProbability,DEFAULT_RATING:DEFAULT};
})();