
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Cleanup existing data
  await prisma.activityLog.deleteMany()
  await prisma.fixAction.deleteMany()
  await prisma.accessibilityIssue.deleteMany()
  await prisma.website.deleteMany()

  // Create a demo website
  const demoSite = await prisma.website.create({
    data: {
      url: 'https://broken-demo.vercel.app',
      healerScore: 58,
      lastScanned: new Date(),
    }
  })

  // Add some initial issues
  const issue1 = await prisma.accessibilityIssue.create({
    data: {
      websiteUrl: demoSite.url,
      issueType: 'missing_alt',
      sourceMode: 'healer',
      description: 'Image missing alt text attribute',
      severity: 'critical',
      status: 'detected',
      codeLocation: 'img.hero-banner',
    }
  })

  // Add an activity log
  await prisma.activityLog.create({
    data: {
      mode: 'healer',
      action: 'scan',
      details: { url: demoSite.url, found: 1, score: 58 }
    }
  })

  console.log('✅ Seed completed')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
