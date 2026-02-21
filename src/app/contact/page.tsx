import Header from '../../components/Header';
import Footer from '../../components/Footer';
import DynamicFAQClient from '../../components/DynamicFAQClient';
import { PageService } from '@/lib/services';
import ContactForm from './ContactForm';
import Image from 'next/image';

type ContactContent = {
  heading?: string
  description?: string
  phone?: string
  email?: string
  address?: string
  mapEmbedUrl?: string
}

function extractContactContent(content: Record<string, unknown> | null | undefined): ContactContent {
  if (!content || typeof content !== 'object') {
    return {}
  }

  const data = content as Record<string, unknown>

  return {
    heading: typeof data.heading === 'string' ? data.heading : undefined,
    description: typeof data.description === 'string' ? data.description : undefined,
    phone: typeof data.phone === 'string' ? data.phone : undefined,
    email: typeof data.email === 'string' ? data.email : undefined,
    address: typeof data.address === 'string' ? data.address : undefined,
    mapEmbedUrl: typeof data.mapEmbedUrl === 'string' ? data.mapEmbedUrl : undefined,
  }
}

export default async function ContactPage() {
  const page = await PageService.getPageBySlug('contact')

  const cmsContent =
    page && typeof page.content === 'object' && page.content !== null
      ? (page.content as Record<string, unknown>)
      : undefined

  const contactContent = page && page.status === 'PUBLISHED'
    ? extractContactContent(cmsContent)
    : {}

  // Default fallback values
  const heading = contactContent.heading || "Let's build Together"
  const description = contactContent.description || ''
  const phone = contactContent.phone || '+977 14988879, 4963659'
  const email = contactContent.email || '3starmeat@gmail.com'
  const address = contactContent.address || 'Tokha-6, Kathmandu, Greenland, Triyog Marg'
  const mapEmbedUrl = contactContent.mapEmbedUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4560.946311392599!2d85.3271149!3d27.7464399!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb19660f4fdcab%3A0xab7cb8e2621a0e16!2s3%20Star%20Meat%20Products!5e1!3m2!1sen!2snp!4v1758604799250!5m2!1sen!2snp'

  // Parse comma-separated phone numbers
  const phoneNumbers = phone.split(',').map(p => p.trim()).filter(Boolean)
  
  // Parse comma-separated emails
  const emails = email.split(',').map(e => e.trim()).filter(Boolean)

  return (
    <>
      <Header variant="inner" />

      <div className="tsf-contact relative py-20">
        <div className="w-full max-w-full mx-auto px-10 2xl:max-w-screen-2xl">
          <div className="grid grid-cols-3">
            <div className="tsf-contact-detail rounded-tl-md rounded-bl-md tsf-bg-secondary p-10">
              <span className="uppercase text-white pb-5 inline-block">contact us</span>
              <h2 className="text-4xl text-white text-align-center font-extrabold tsf-font-sora">{heading}</h2>
              {description && (
                <p className="text-white mt-4 opacity-90">{description}</p>
              )}
              <div className="detail-list pt-8">
                <div className="detail-list-item pb-5">
                  <div className="flex items-center">
                    <div className="detail-img p-5 bg-white rounded-full"><Image src="/images/location.svg" alt="location" width={24} height={24} /></div>
                    <div className="detail-text pl-5">
                      <p className="text-white line-height-10" dangerouslySetInnerHTML={{ __html: address.replace(/\n/g, '<br />') }} />
                    </div>
                  </div>
                </div>
                <div className="detail-list-item pb-5">
                  <div className="flex items-center">
                    <div className="detail-img p-5 bg-white rounded-full"><Image src="/images/call.svg" alt="call" width={24} height={24} /></div>
                    <div className="detail-text pl-5">
                      <div className="text-white line-height-10">
                        {phoneNumbers.map((phoneNumber, index) => (
                          <span key={index}>
                            <a href={`tel:${phoneNumber.replace(/\s+/g, '')}`} className="text-white hover:underline">
                              {phoneNumber}
                            </a>
                            {index < phoneNumbers.length - 1 && <span>, </span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="detail-list-item">
                  <div className="flex items-center">
                    <div className="detail-img p-5 bg-white rounded-full"><Image src="/images/email.svg" alt="email" width={24} height={24} /></div>
                    <div className="detail-text pl-5">
                      <div className="text-white line-height-10">
                        {emails.map((emailAddr, index) => (
                          <span key={index}>
                            <a href={`mailto:${emailAddr}`} className="text-white hover:underline">
                              {emailAddr}
                            </a>
                            {index < emails.length - 1 && <span>, </span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="tsf-contact-form col-span-2 rounded-tr-md rounded-br-md w-full tsf-bg-gray p-10 z-10">
              <ContactForm />
            </div>
          </div>
          <div className="contact-map pt-20">
            <iframe 
              className="rounded-md" 
              src={mapEmbedUrl} 
              width="100%" 
              height="450" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>

      <DynamicFAQClient />

      <Footer />
    </>
  );
}
