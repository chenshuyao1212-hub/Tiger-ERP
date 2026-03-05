
import axios from 'axios';

export interface ProductSaleDayOpenVo {
  day: string;
  productNum: string;
  orderNum: string;
  salePrice: string;
}

export interface ProductSaleOpenVo {
  asin: string;
  parentAsin: string;
  msku: string;
  sku: string;
  title: string;
  imageUrl: string;
  shopName: string;
  marketplaceId: string;
  productNum: string;
  orderNum: string;
  salePrice: string;
  productSaleDayOpenVo: ProductSaleDayOpenVo[];
}

export interface PageProductSaleOpenVo {
  rows: ProductSaleOpenVo[];
  totalSize: number;
}

export interface ProductSaleParams {
  type: 'productNum' | 'orderNum' | 'salePrice';
  groupType: 'asin' | 'parentAsin' | 'msku' | 'sku';
  startDate: string;
  endDate: string;
  pageNo: number;
  pageSize: number;
  shopIdList?: string[];
  searchType?: string;
  searchContentList?: string[];
  fulfillmentChannel?: string;
  siteList?: string[];
}

export class SalesStatService {
  static async getSalesData(params: ProductSaleParams): Promise<{ code: number; msg: string; data: PageProductSaleOpenVo }> {
    try {
      const response = await axios.post('/api/sales/stat', params);
      return response.data;
    } catch (error: any) {
      return {
        code: -1,
        msg: error.message || 'Failed to fetch sales data',
        data: { rows: [], totalSize: 0 }
      };
    }
  }
}
