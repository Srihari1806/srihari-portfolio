import { Project, Role } from '@/types';
const roles: Role[] = ['Product Management','Software Development','Data Analytics','UI/UX Design','Marketing & Growth','Creative Strategy'];
const entries = [
 {slug:'cricfield',title:'CricField',subtitle:'Cricket analytics and pressure intelligence',problem:'Make cricket data useful for exploring players, teams and tactical questions.',status:'Live platform; further improvements in progress.',image:'https://cricfield.in/TITLE%20BANNER.png'},
 {slug:'hiremap',title:'HireMap',subtitle:'Career discovery and preparation',problem:'Connect job discovery, resume assessment and learning direction.',status:'In development. Proposed features are not completed contributions.',image:''},
 {slug:'cinevault',title:'OTT vs Theatre',subtitle:'Cinema, culture and business exploration',problem:'Explore the audience and business decisions behind cinema and streaming.',status:'Concept and interface development. Results not yet measured.',image:''},
 {slug:'iot-pulse',title:'Electronics experiments',subtitle:'Circuits and software on the workbench',problem:'Explore how electronics and software work together.',status:'Planned documentation. Project evidence to be added.',image:''},
 {slug:'lyriclab',title:'Creative publishing',subtitle:'Original lyrics and writing',problem:'Create a home for original writing and creative work.',status:'Publishing portfolio in development. Verified links to be added.',image:''},
];
export const projects: Project[] = entries.map(e=>({id:e.slug,slug:e.slug,title:e.title,subtitle:e.subtitle,tagline:e.problem,timeframe:e.status,featured:e.slug==='cricfield',coverImage:e.image,category:e.subtitle,primaryRole:'Product Management',supportedRoles:roles,techStack:[],links:e.slug==='cricfield'?{liveDemo:'https://www.cricfield.in',github:'https://github.com/CRICFIELD-INTELLIGENGE/IPL-ANALYTICAL-ENGINE'}:{},perspectives:Object.fromEntries(roles.map(role=>[role,{role,summary:`${e.subtitle} — ${role} perspective. ${e.status}`,keyResponsibilities:[e.status],problem:e.problem,decisions:['Detailed decision notes and supporting evidence will be added to this case study.'],implementation:[e.status],metrics:[],deliverables:[]}])) as unknown as Project['perspectives']}));


