import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    // Connect to Clerk's backend and search for the exact email
    const client = clerkClient();
    const users = await (await client).users.getUserList({
      emailAddress: [email],
    });

    // If totalCount is greater than 0, the email is already in your system
    const exists = users.totalCount > 0;

    return NextResponse.json({ exists });
    
  } catch (error) {
    console.error("Error checking email:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}