import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const showAll = searchParams.get("all") === "1";
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const pageSize = Math.max(1, Number(searchParams.get("pageSize") || 10));

    if (showAll) {
      const questions = await prisma.question.findMany({ orderBy: { id: "desc" } });
      return NextResponse.json({
        success: true,
        questions,
        pagination: { total: questions.length, page: 1, pageSize: questions.length, totalPages: 1 },
      });
    }

    const total = await prisma.question.count();
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * pageSize;

    const questions = await prisma.question.findMany({
      orderBy: { id: "desc" },
      skip,
      take: pageSize,
    });

    return NextResponse.json({
      success: true,
      questions,
      pagination: { total, page: safePage, pageSize, totalPages },
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { success: false, error: "Error loading questions" },
      { status: 500 }
    );
  }
}
