import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env')
  }

  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix headers', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error: Invalid signature', { status: 400 })
  }

  const eventType = evt.type

  // --- 1. HANDLE ACCOUNT CREATION ---
  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data

    if (!id) {
      return new Response('Error: Missing user data', { status: 400 })
    }

    const primaryEmail = email_addresses && email_addresses.length > 0 
      ? email_addresses[0].email_address 
      : `test-user-${id}@example.com`;

    try {
      await prisma.user.upsert({
        where: { id: id },
        update: {
          email: primaryEmail,
          name: `${first_name || ''} ${last_name || ''}`.trim() || 'New User',
        },
        create: {
          id: id,
          email: primaryEmail,
          name: `${first_name || ''} ${last_name || ''}`.trim() || 'New User',
        },
      })
      console.log(`✅ User ${id} successfully handled (upserted) in PostgreSQL!`)
    } catch (error) {
      console.error('❌ Error saving user to database:', error)
      return new Response('Error saving user', { status: 500 })
    }
  }

  // --- 2. HANDLE ACCOUNT UPDATES ---
  if (eventType === 'user.updated') {
    const { id, first_name, last_name } = evt.data;
    const fullName = `${first_name || ""} ${last_name || ""}`.trim();

    try {
      await prisma.user.update({
        where: { id: id },
        data: { 
          name: fullName !== "" ? fullName : "Unknown User",
        }
      });
      console.log(`✅ User ${id} updated in Prisma via Webhook!`);
    } catch (error) {
      console.error('❌ Error updating user in database:', error)
      return new Response('Error updating user', { status: 500 })
    }
  }

  // --- 3. HANDLE ACCOUNT DELETION ---
  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    if (!id) {
      return new Response('Error: Missing user ID', { status: 400 })
    }

    try {
      await prisma.user.delete({
        where: { id: id }
      });
      console.log(`🗑️ User ${id} deleted from Prisma via Webhook!`);
    } catch (error) {
      console.error('❌ Error deleting user from database:', error)
      return new Response('Error deleting user', { status: 500 })
    }
  }

  return NextResponse.json({ message: 'Webhook processed' }, { status: 200 })
}