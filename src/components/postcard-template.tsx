import React from 'react';
import { Customer } from '@/types/customer';

interface PostcardTemplateProps {
    customer: Customer;
}

export default function PostcardTemplate({ customer }: PostcardTemplateProps) {
    return (
        <div className="postcard-print-area hidden print:block bg-white text-black font-serif">
            {/* 
        Japanese Postcard Size: 100mm x 148mm 
        We use a container that fits this aspect ratio and print styles.
      */}
            <style jsx global>{`
        @media print {
          @page {
            size: 100mm 148mm;
            margin: 0;
          }
          body * {
            visibility: hidden;
          }
          .postcard-print-area, .postcard-print-area * {
            visibility: visible;
          }
          .postcard-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100mm;
            height: 148mm;
            padding: 10mm;
            box-sizing: border-box;
            overflow: hidden;
          }
        }
      `}</style>

            <div className="h-full flex flex-col justify-between writing-vertical-rl text-lg leading-loose">
                {/* Recipient Address & Name */}
                <div className="flex flex-col items-start h-[80%] mt-4">
                    <div className="text-sm mb-2 tracking-wider">
                        {customer.postalCode && `〒${customer.postalCode}`}
                    </div>
                    <div className="text-base mb-4 tracking-widest">
                        {customer.address}
                    </div>
                    <div className="text-2xl font-bold mt-4 tracking-widest">
                        {customer.name} 様
                    </div>
                </div>

                {/* Sender Info (Komine Cemetery) */}
                <div className="flex flex-col items-end text-xs text-gray-600 mb-2 ml-auto">
                    <div className="mb-1">〒XXX-XXXX</div>
                    <div className="mb-1">〇〇県〇〇市〇〇町1-2-3</div>
                    <div className="font-bold text-sm">小峰霊園 管理事務所</div>
                    <div>TEL: 03-XXXX-XXXX</div>
                </div>
            </div>

            {/* Back side (Content) - For now we assume single side printing or this is the back side? 
          Usually postcards have address on one side, content on the other.
          The user request implies "Postcard Printing" which often means the content side or address side.
          Given "Name and Date entered", it sounds like the content side or a combined view.
          Let's make a second page for the content if needed, or just assume this is the address side for now 
          as that's the most critical "data filled" part. 
          
          Wait, the user said "Name and Date entered... check and print". 
          Let's add a simple content area on a second page or assume this is a "Letter" style postcard.
          
          Actually, let's make it a single page layout that simulates the *back* (content) side 
          if the user wants a message, OR the *front* (address) side.
          
          Let's implement the CONTENT side as a default "Notice" since that's more useful for a CRM.
          But standard postcards have address on front.
          
          Let's do a standard "Greeting" layout.
      */}
        </div>
    );
}

export function PostcardContentTemplate({ customer }: PostcardTemplateProps) {
    return (
        <div className="postcard-content-print-area hidden print:block bg-white text-black font-serif">
            <style jsx global>{`
        @media print {
          .postcard-content-print-area, .postcard-content-print-area * {
            visibility: visible;
          }
          .postcard-content-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100mm;
            height: 148mm;
            padding: 10mm;
            box-sizing: border-box;
            overflow: hidden;
            page-break-before: always; 
          }
        }
      `}</style>

            <div className="h-full flex flex-col writing-vertical-rl text-lg leading-loose items-center pt-10">
                <h1 className="text-xl font-bold mb-8 tracking-widest">合祀法要のご案内</h1>

                <div className="mb-4">
                    拝啓
                </div>

                <div className="mb-4">
                    {/* Generic seasonal greeting or placeholder */}
                    時下ますますご清祥のこととお慶び申し上げます。
                </div>

                <div className="mb-4">
                    さて、この度、故 {customer.buriedPersons?.[0]?.name || '〇〇'} 様の
                    合祀法要を執り行いますので、ご案内申し上げます。
                </div>

                <div className="mt-auto mb-8 text-sm">
                    令和〇年〇月〇日
                </div>

                <div className="font-bold">
                    小峰霊園 管理事務所
                </div>
            </div>
        </div>
    )
}
