import React from 'react';
import type { SVGProps } from 'react';

export default function Confirm(props: SVGProps<SVGSVGElement>) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}><g fill="none" stroke="#44ff00" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}><path fill="#44ff00" fillOpacity={0.3} d="M3 12c0 -4.97 4.03 -9 9 -9c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9Z"><animate fill="freeze" attributeName="fill-opacity" dur="0.15s" values="0.3;0"></animate></path><path strokeDasharray={14} strokeDashoffset={14} d="M8 12l3 3l5 -5"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.15s" dur="0.2s" values="14;0"></animate></path></g></svg>);
}