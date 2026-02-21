import Header from '../../components/Header';
import Footer from '../../components/Footer';
import DynamicFAQ from '../../components/DynamicFAQ';
import { PageService } from '@/lib/services';
import Image from 'next/image';
import AnimatedCounter from '../../components/AnimatedCounter';
import VideoPlayer from '../../components/VideoPlayer';
import { Sprout } from 'lucide-react';

type TeamMember = {
  name: string;
  phone?: string;
  avatar?: string;
}

type TeamDepartment = {
  name: string;
  members: TeamMember[];
}

type StatData = {
  value: number;
  suffix: string;
  label: string;
}

type FeatureData = {
  icon?: string;
  title: string;
}

type AboutContent = {
  videoUrl?: string;
  videoThumbnail?: string;
  videoThumbnailAlt?: string;
  stats: StatData[];
  whoWeAreHeading?: string;
  whoWeAreContent?: string;
  whoWeAreImage?: string;
  whyChooseUsHeading?: string;
  whyChooseUsDescription?: string;
  whyChooseUsTeamImage?: string;
  whyChooseUsFeatures: FeatureData[];
  teamDepartments: TeamDepartment[];
}

function extractArray(source: Record<string, unknown>, key: string) {
  const value = source[key]
  return Array.isArray(value)
    ? (value.filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null))
    : []
}

function extractAboutContent(content: Record<string, unknown> | null | undefined): AboutContent {
  if (!content || typeof content !== 'object') {
    return { stats: [], whyChooseUsFeatures: [], teamDepartments: [] }
  }

  const data = content as Record<string, unknown>

  const stats = extractArray(data, 'stats')
    .map((item) => {
      const valueStr = typeof item.value === 'string' ? item.value : typeof item.value === 'number' ? String(item.value) : undefined
      const value = valueStr ? parseInt(valueStr, 10) : undefined
      const suffix = typeof item.suffix === 'string' ? item.suffix : '+'
      const label = typeof item.label === 'string' ? item.label : undefined

      if (value === undefined || !label) {
        return null
      }

      return {
        value,
        suffix,
        label,
      } satisfies StatData
    })
    .filter((item): item is StatData => item !== null)

  const features = extractArray(data, 'whyChooseUsFeatures')
    .map((item) => {
      const title = typeof item.title === 'string' ? item.title : undefined
      if (!title) {
        return null
      }

      return {
        icon: typeof item.icon === 'string' ? item.icon : undefined,
        title,
      } as FeatureData
    })
    .filter((item): item is FeatureData => item !== null)

  const teamDepartments = extractArray(data, 'departments')
    .map((item) => {
      const name = typeof item.name === 'string' ? item.name : undefined
      if (!name) return null

      const rawMembers = Array.isArray(item.members)
        ? (item.members as unknown[]).filter(
          (m): m is Record<string, unknown> => typeof m === 'object' && m !== null
        )
        : []

      const members = rawMembers
        .map((m): TeamMember | null => {
          const memberName = typeof m.name === 'string' ? m.name : undefined
          if (!memberName) return null

          return {
            name: memberName,
            phone: typeof m.phone === 'string' ? m.phone : undefined,
            avatar: typeof m.avatar === 'string' ? m.avatar : undefined,
          }
        })
        .filter((m): m is TeamMember => m !== null)

      if (members.length === 0) return null

      return {
        name,
        members,
      } satisfies TeamDepartment
    })
    .filter((d): d is TeamDepartment => d !== null)

  return {
    videoUrl: typeof data.videoUrl === 'string' ? data.videoUrl : undefined,
    videoThumbnail: typeof data.videoThumbnail === 'string' ? data.videoThumbnail : undefined,
    videoThumbnailAlt: typeof data.videoThumbnailAlt === 'string' ? data.videoThumbnailAlt : 'About Three Star Foods',
    stats,
    whoWeAreHeading: typeof data.whoWeAreHeading === 'string' ? data.whoWeAreHeading : 'Who We Are',
    whoWeAreContent: typeof data.whoWeAreContent === 'string' ? data.whoWeAreContent : undefined,
    whoWeAreImage: typeof data.whoWeAreImage === 'string' ? data.whoWeAreImage : undefined,
    whyChooseUsHeading: typeof data.whyChooseUsHeading === 'string' ? data.whyChooseUsHeading : 'Why Choose Us',
    whyChooseUsDescription: typeof data.whyChooseUsDescription === 'string' ? data.whyChooseUsDescription : undefined,
    whyChooseUsTeamImage: typeof data.whyChooseUsTeamImage === 'string' ? data.whyChooseUsTeamImage : undefined,
    whyChooseUsFeatures: features,
    teamDepartments,
  }
}

export default async function AboutPage() {
  const page = await PageService.getPageBySlug('about-us')

  const cmsContent =
    page && typeof page.content === 'object' && page.content !== null
      ? (page.content as Record<string, unknown>)
      : undefined

  const aboutContent = page && page.status === 'PUBLISHED'
    ? extractAboutContent(cmsContent)
    : { stats: [], whyChooseUsFeatures: [], teamDepartments: [] }

  // Default fallback values
  const defaultStats: StatData[] = [
    { value: 100, suffix: '+', label: 'Food Items' },
    { value: 3000, suffix: '+', label: 'Happy Customers' },
    { value: 15, suffix: '+', label: 'Years' },
  ]

  const defaultFeatures: FeatureData[] = [
    { icon: '/images/quality.webp', title: 'Uncompromising Quality' },
    { icon: '/images/quality.webp', title: 'Punctuality' },
    { icon: '/images/quality.webp', title: 'Punctuality' },
    { icon: '/images/quality.webp', title: 'Punctuality' },
    { icon: '/images/quality.webp', title: 'Punctuality' },
    { icon: '/images/quality.webp', title: 'Punctuality' },
  ]

  const stats = aboutContent.stats.length > 0 ? aboutContent.stats : defaultStats
  const features = aboutContent.whyChooseUsFeatures.length > 0 ? aboutContent.whyChooseUsFeatures : defaultFeatures

  return (
    <>
      <Header variant="inner" />

      {(aboutContent.videoUrl || aboutContent.videoThumbnail) && (
        <div className="tsf-about tsf-bg-lightgreen relative py-10 md:py-20 px-10">
          <div className="w-full md:max-w-5xl mx-auto flex justify-center">
            <VideoPlayer
              src={aboutContent.videoUrl || '/images/video.mp4'}
              thumbnail={aboutContent.videoThumbnail || '/images/bg-about.webp'}
              thumbnailAlt={aboutContent.videoThumbnailAlt || 'About Three Star Foods'}
              className="w-full"
            />
          </div>
        </div>
      )}

      {stats.length > 0 && (
        <div className="tsf-about-video relative py-25 md:py-40 tsf-bg-secondary">
          <div className="w-full max-w-full mx-auto px-10 2xl:max-w-screen-2xl">
            <div className={`grid grid-cols-1 gap-10 ${
              stats.length === 1 
                ? 'md:grid-cols-1' 
                : stats.length === 2 
                ? 'md:grid-cols-2' 
                : stats.length === 3 
                ? 'md:grid-cols-3' 
                : stats.length === 4 
                ? 'md:grid-cols-2 lg:grid-cols-4' 
                : 'md:grid-cols-3'
            }`}>
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <AnimatedCounter
                    target={stat.value}
                    suffix={stat.suffix}
                    className="tsf-font-sora text-4xl md:text-6xl font-bold text-white block"
                  />
                  <p className="tsf-font-sora text-lg md:text-xl text-white mt-2">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {(aboutContent.whoWeAreHeading || aboutContent.whoWeAreContent) && (
        <div className="tsf-about relative py-20 overflow-hidden">
          {/* Floating food items */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Chicken */}
            <div className="absolute top-10 left-10 w-20 h-20 opacity-20 animate-float">
              <div className="text-6xl">🍗</div>
            </div>
            {/* Burger */}
            <div className="absolute top-32 right-20 w-16 h-16 opacity-20 animate-float-delayed">
              <div className="text-5xl">🍔</div>
            </div>
            {/* Fish */}
            <div className="absolute bottom-20 left-20 w-16 h-16 opacity-20 animate-float-slow">
              <div className="text-5xl">🐟</div>
            </div>
            {/* Meat */}
            <div className="absolute top-1/2 right-10 w-20 h-20 opacity-20 animate-float">
              <div className="text-6xl">🥩</div>
            </div>
            {/* Sausage */}
            <div className="absolute bottom-32 right-32 w-14 h-14 opacity-20 animate-float-delayed">
              <div className="text-4xl">🌭</div>
            </div>
            {/* Bacon */}
            <div className="absolute top-1/4 left-1/4 w-16 h-16 opacity-20 animate-float-slow">
              <div className="text-5xl">🥓</div>
            </div>
            {/* Drumstick */}
            <div className="absolute bottom-10 right-1/4 w-18 h-18 opacity-20 animate-float">
              <div className="text-5xl">🍗</div>
            </div>
          </div>

          <div className="w-full max-w-full mx-auto px-10 2xl:max-w-screen-2xl relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="tsf-about-content text-center">
                {aboutContent.whoWeAreHeading && (
                  <h2 className="tsf-font-sora text-4xl font-bold uppercase mb-8">{aboutContent.whoWeAreHeading}</h2>
                )}
                {aboutContent.whoWeAreContent && (
                  <p className="tsf-font-sora text-base md:text-xl/8 max-w-3xl mx-auto">
                    {aboutContent.whoWeAreContent.split('\n').map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < aboutContent.whoWeAreContent!.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative pt-0 pb-20 md:pt-10 md:pb-24 bg-white">
        <div className="w-full max-w-full mx-auto px-6 md:px-10 2xl:max-w-screen-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto">
            {/* Fresh From Farm */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-100 p-8 md:p-10 hover:shadow-sm transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/30 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500 mb-6">
                  <Sprout className="w-10 h-10 text-white" />
                </div>
                <h3 className="tsf-font-sora text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  Fresh From Farm
                </h3>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                  We source the freshest ingredients directly from trusted farms, ensuring quality and freshness in every product.
                </p>
              </div>
            </div>

            {/* Affordable Pricing */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 p-8 md:p-10 hover:shadow-sm transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500 mb-6">
                  <span className="text-3xl md:text-3xl font-bold text-white">रु</span>
                </div>
                <h3 className="tsf-font-sora text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  Affordable Pricing
                </h3>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                  Quality doesn&apos;t have to break the bank. We offer competitive prices without compromising on freshness and quality.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {(aboutContent.whyChooseUsHeading || aboutContent.whyChooseUsDescription || aboutContent.whyChooseUsTeamImage || features.length > 0) && (
        <div className="tsf-choose-us tsf-bg-secondary relative py-30 md:py-40">
          <div className="w-full max-w-full mx-auto px-10 2xl:max-w-screen-2xl">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10">
              <div className="col-span-1">
                <div className="tsf-choose-us-content">
                  {aboutContent.whyChooseUsHeading && (
                    <h2 className="mb-6 tsf-font-sora text-2xl md:text-4xl font-bold uppercase text-white">{aboutContent.whyChooseUsHeading}</h2>
                  )}
                  {aboutContent.whyChooseUsDescription && (
                    <p className="tsf-font-sora mt-3 md:mt-5 text-base md:text-xl/8 text-white">{aboutContent.whyChooseUsDescription}</p>
                  )}
                  {aboutContent.whyChooseUsTeamImage && (
                    <div className="relative w-full pt-6 md:pt-10">
                      <div className="relative w-full bg-gradient-to-br from-white/10 to-white/5 rounded-xl tsf-box-shadow hover:shadow-xl transition-all duration-300">
                        <div className="relative w-full rounded-lg overflow-hidden border-4 border-white/20 shadow-inner">
                          <Image
                            src={aboutContent.whyChooseUsTeamImage}
                            alt="Our Team"
                            width={800}
                            height={800}
                            className="w-full h-auto object-cover"
                            priority={false}
                          />
                        </div>
                        {/* Decorative corner accents */}
                        <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-white/60 rounded-tl-lg"></div>
                        <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-white/60 rounded-br-lg"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {features.length > 0 && (
                <div className="col-span-1">
                  <div className="tsf-choose-us-content space-y-3 md:space-y-4">
                    {features.map((feature, index) => {
                      const isEven = index % 2 === 0;
                      return (
                        <div
                          key={index}
                          className={`relative group tsf-bg-red tsf-box-shadow flex items-center gap-2 md:gap-3 p-2.5 md:p-3 rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${isEven ? 'ml-0' : 'md:ml-4'
                            }`}
                          style={{
                            animationDelay: `${index * 100}ms`,
                          }}
                        >
                          {/* Icon container with background */}
                          {feature.icon && (
                            <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-lg flex items-center justify-center p-1 md:p-1.5 group-hover:bg-white/30 transition-colors">
                              <Image
                                src={feature.icon}
                                className="object-contain"
                                alt={feature.title}
                                width={32}
                                height={32}
                              />
                            </div>
                          )}

                          {/* Text content */}
                          <div className="flex-1">
                            <h4 className="tsf-font-sora text-sm md:text-base font-bold uppercase text-white leading-tight group-hover:text-white/90 transition-colors">
                              {feature.title}
                            </h4>
                          </div>

                          {/* Decorative gradient overlay on hover */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none"></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {aboutContent.teamDepartments.length > 0 && (
        <section className="tsf-our-team relative pt-20 bg-white">
          <div className="w-full max-w-full mx-auto px-6 md:px-10 2xl:max-w-screen-2xl">
            <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
              <h2 className="tsf-font-sora text-3xl md:text-4xl font-bold tracking-tight text-[#030e55] mb-3">
                Our Team
              </h2>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                Meet the dedicated professionals behind Three Star Foods, working across departments to ensure quality, service, and reliability every day.
              </p>
            </div>

            <div className="space-y-16 md:space-y-20">
              {aboutContent.teamDepartments.map((dept) => (
                <div key={dept.name} className="space-y-4 md:space-y-6">
                  <div className="text-center">
                    <h3 className="mb-10 tsf-font-sora text-2xl md:text-3xl font-bold text-[#030e55]">
                      {dept.name}
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
                    {dept.members.map((member) => {
                      const avatarSrc = member.avatar || '/images/user01.svg'
                      return (
                        <div
                          key={`${dept.name}-${member.name}-${member.phone ?? ''}`}
                          className="group flex flex-col items-center text-center px-4 py-5 rounded-xl border border-gray-200 bg-white hover:border-[#ff4900] hover:shadow-lg transition-all duration-300 w-[calc(50%-0.5rem)] md:w-[calc(20%-1.2rem)]"
                        >
                          <div className="relative mb-3">
                            <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-gray-100 overflow-hidden border-2 border-gray-200 group-hover:border-[#ff4900] transition-colors shadow-sm">
                              <Image
                                src={avatarSrc}
                                alt={member.name}
                                width={96}
                                height={96}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </div>
                          <h4 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1 line-clamp-2">
                            {member.name}
                          </h4>
                          {member.phone && (
                            <a
                              href={`tel:${member.phone.replace(/\s+/g, '')}`}
                              className="text-xs md:text-sm text-gray-600 hover:text-[#ff4900] transition-colors"
                            >
                              {member.phone}
                            </a>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <DynamicFAQ />

      <Footer />
    </>
  );
}
