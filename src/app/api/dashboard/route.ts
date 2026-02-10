import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getStoreDashboardData, getMockDashboardData } from '@/lib/bigquery';

export interface DashboardFilters {
  dateStart?: string;
  dateEnd?: string;
  regional?: string;
  subDistrict?: string;
  distributionChannel?: string;
  siteName?: string;
  materialType?: string;
  productType?: string;
  mgh1?: string;
  mgh2?: string;
  mgh3?: string;
  mgh4?: string;
  gwp?: string;
  bogo?: string;
  idRa?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.storeId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const storeId = session.user.storeId;
    const userSubDistrict = session.user.subDistrict;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';

    // Get filter parameters
    const filters: DashboardFilters = {
      dateStart: searchParams.get('dateStart') || undefined,
      dateEnd: searchParams.get('dateEnd') || undefined,
      regional: searchParams.get('regional') || undefined,
      subDistrict: searchParams.get('subDistrict') || undefined,
      distributionChannel: searchParams.get('distributionChannel') || undefined,
      siteName: searchParams.get('siteName') || undefined,
      materialType: searchParams.get('materialType') || undefined,
      productType: searchParams.get('productType') || undefined,
      mgh1: searchParams.get('mgh1') || undefined,
      mgh2: searchParams.get('mgh2') || undefined,
      mgh3: searchParams.get('mgh3') || undefined,
      mgh4: searchParams.get('mgh4') || undefined,
      gwp: searchParams.get('gwp') || undefined,
      bogo: searchParams.get('bogo') || undefined,
      idRa: searchParams.get('idRa') || undefined,
    };

    // Use mock data for development, real BigQuery for production
    const useMockData = process.env.NODE_ENV === 'development' || !process.env.GOOGLE_CLOUD_PROJECT;

    let data;
    if (useMockData) {
      data = getMockDashboardData(userSubDistrict, filters);
    } else {
      data = await getStoreDashboardData(storeId, period);
    }

    return NextResponse.json({
      storeId,
      storeName: session.user.storeName,
      period,
      data,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
