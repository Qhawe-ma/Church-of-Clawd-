import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { password } = await request.json();
        const correct = process.env.ADMIN_PASSWORD;
        if (!correct) {
            return NextResponse.json({ success: false, error: "ADMIN_PASSWORD is not set in environment." }, { status: 500 });
        }
        if (password !== correct) {
            return NextResponse.json({ success: false, error: "Wrong password." }, { status: 401 });
        }
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
