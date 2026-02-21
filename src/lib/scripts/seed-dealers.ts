#!/usr/bin/env tsx

import { prisma } from '@/lib/db'
import { PageStatus, Prisma } from '@prisma/client'

const dealersData = [
  {
    name: 'Kathmandu Central Store',
    city: 'Kathmandu',
    address: 'New Road, Kathmandu',
    phone: '+977-1-4221234',
    email: 'kathmandu@3starfoods.com',
    latitude: '27.7172',
    longitude: '85.3240'
  },
  {
    name: 'Itahari Meat Center',
    city: 'Itahari',
    address: 'Main Road, Itahari',
    phone: '+977-25-580123',
    email: 'itahari@3starfoods.com',
    latitude: '26.6617',
    longitude: '87.2742'
  },
  {
    name: 'Chitwan Meat Hub',
    city: 'Chitwan',
    address: 'Bharatpur, Chitwan',
    phone: '+977-56-567890',
    email: 'chitwan@3starfoods.com',
    latitude: '27.7000',
    longitude: '84.4333'
  },
  {
    name: 'Butwal Fresh Foods',
    city: 'Butwal',
    address: 'Main Road, Butwal',
    phone: '+977-71-540123',
    email: 'butwal@3starfoods.com',
    latitude: '27.7000',
    longitude: '83.4483'
  },
  {
    name: 'Nepalgunj Store',
    city: 'Nepalgunj',
    address: 'Main Road, Nepalgunj',
    phone: '+977-81-520123',
    email: 'nepalgunj@3starfoods.com',
    latitude: '28.0500',
    longitude: '81.6167'
  },
  {
    name: 'Dhankuta Dealer',
    city: 'Dhankuta',
    address: 'Main Street, Dhankuta',
    phone: '+977-26-520123',
    email: 'dhankuta@3starfoods.com',
    latitude: '26.9833',
    longitude: '87.3333'
  },
  {
    name: 'Dharan Dealer',
    city: 'Dharan',
    address: 'Main Road, Dharan',
    phone: '+977-25-520123',
    email: 'dharan@3starfoods.com',
    latitude: '26.8167',
    longitude: '87.2833'
  },
  {
    name: 'Bardibas Dealer',
    city: 'Bardibas',
    address: 'Highway Road, Bardibas',
    phone: '+977-44-520123',
    email: 'bardibas@3starfoods.com',
    latitude: '26.7167',
    longitude: '85.9000'
  },
  {
    name: 'Nijgad Dealer',
    city: 'Nijgad',
    address: 'Main Street, Nijgad',
    phone: '+977-44-520124',
    email: 'nijgad@3starfoods.com',
    latitude: '27.1667',
    longitude: '85.1167'
  },
  {
    name: 'Charikot Dealer',
    city: 'Charikot',
    address: 'Center Road, Charikot',
    phone: '+977-49-520123',
    email: 'charikot@3starfoods.com',
    latitude: '27.6500',
    longitude: '86.0333'
  },
  {
    name: 'Dhading Dealer',
    city: 'Dhading',
    address: 'Main Road, Dhading',
    phone: '+977-10-520123',
    email: 'dhading@3starfoods.com',
    latitude: '27.8667',
    longitude: '84.9167'
  },
  {
    name: 'Aabukhaireni Dealer',
    city: 'Aabukhaireni',
    address: 'Highway Road, Aabukhaireni',
    phone: '+977-65-520123',
    email: 'aabukhaireni@3starfoods.com',
    latitude: '27.9167',
    longitude: '84.1167'
  },
  {
    name: 'Gorkha Dealer',
    city: 'Gorkha',
    address: 'Main Street, Gorkha',
    phone: '+977-64-520123',
    email: 'gorkha@3starfoods.com',
    latitude: '28.0000',
    longitude: '84.6333'
  },
  {
    name: 'Khairenitar Dealer',
    city: 'Khairenitar',
    address: 'Center Road, Khairenitar',
    phone: '+977-65-520124',
    email: 'khairenitar@3starfoods.com',
    latitude: '27.9500',
    longitude: '84.2500'
  },
  {
    name: 'Palpa Dealer',
    city: 'Palpa',
    address: 'Main Road, Palpa',
    phone: '+977-75-520123',
    email: 'palpa@3starfoods.com',
    latitude: '27.8667',
    longitude: '83.5500'
  },
  {
    name: 'Pokhara Dealer',
    city: 'Pokhara',
    address: 'Lakeside Road, Pokhara',
    phone: '+977-61-520123',
    email: 'pokhara@3starfoods.com',
    latitude: '28.2096',
    longitude: '83.9856'
  },
  {
    name: 'Beni Dealer',
    city: 'Beni, Myagdi',
    address: 'Main Road, Beni',
    phone: '+977-69-520123',
    email: 'beni@3starfoods.com',
    latitude: '28.3500',
    longitude: '83.6167'
  },
  {
    name: 'Dang Dealer',
    city: 'Dang, Tulsipur',
    address: 'Highway Road, Tulsipur',
    phone: '+977-82-520123',
    email: 'dang@3starfoods.com',
    latitude: '28.1167',
    longitude: '82.2833'
  },
  {
    name: 'Dhangadhi Dealer',
    city: 'Dhangadhi',
    address: 'Main Road, Dhangadhi',
    phone: '+977-91-520123',
    email: 'dhangadhi@3starfoods.com',
    latitude: '28.6833',
    longitude: '80.6167'
  },
  {
    name: 'Mahendranagar Dealer',
    city: 'Mahendranagar',
    address: 'Highway Road, Mahendranagar',
    phone: '+977-99-520123',
    email: 'mahendranagar@3starfoods.com',
    latitude: '28.9167',
    longitude: '80.3333'
  }
]

async function main() {
  console.log('🌱 Starting Dealers Seeding...')
  
  try {
    // Check if dealers page already exists
    const existingPage = await prisma.page.findUnique({
      where: { slug: 'our-dealers' }
    })

    const dealersPageContent = {
      heading: 'Find Our Dealers Near You',
      description: 'We have authorized dealers across Nepal to serve you with the freshest meat products. Use the map below to find the nearest dealer in your city.',
      dealers: dealersData
    }

    if (existingPage) {
      // Update existing page
      await prisma.page.update({
        where: { slug: 'our-dealers' },
        data: {
          content: dealersPageContent as Prisma.InputJsonValue,
          status: PageStatus.PUBLISHED,
          publishedAt: new Date()
        }
      })
      console.log('✅ Updated existing dealers page')
    } else {
      // Create new page
      await prisma.page.create({
        data: {
          title: 'Our Dealers',
          slug: 'our-dealers',
          template: 'dealers',
          content: dealersPageContent as Prisma.InputJsonValue,
          seo: {},
          status: PageStatus.PUBLISHED,
          publishedAt: new Date()
        }
      })
      console.log('✅ Created dealers page')
    }

    console.log(`✅ Seeded ${dealersData.length} dealers successfully!`)
    process.exit(0)
  } catch (error) {
    console.error('❌ Dealers seeding failed:', error)
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('💥 Unexpected error:', error)
  process.exit(1)
})
