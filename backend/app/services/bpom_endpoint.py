import httpx
from bs4 import BeautifulSoup
from typing import Dict, Optional
import re

class BPOMScraper:
    def __init__(self):
        self.base_url = "https://cekbpom.pom.go.id"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }

    def _get_query_variants(self, bpom_number: str) -> list:
        clean = re.sub(r'[^a-zA-Z0-9]', '', bpom_number).upper()
        
        match = re.match(r'^([A-Z]{2}|PIRT)(\d+)$', clean)
        if match:
            prefix, number = match.groups()
            return [
                f"{prefix} {number}",
                f"{prefix}{number}",
                bpom_number.strip().upper()
            ]
        
        return [bpom_number.strip().upper()]

    async def search_bpom(self, bpom_number: str) -> Optional[Dict]:
        variants = self._get_query_variants(bpom_number)
        
        for search_query in variants:
            result = await self._scrape_single_query(search_query)
            if result:
                return result
        
        return None

    async def _scrape_single_query(self, search_query: str) -> Optional[Dict]:
        async with httpx.AsyncClient(timeout=45.0, follow_redirects=True) as client:
            try:
                home_response = await client.get(self.base_url, headers=self.headers)
                soup = BeautifulSoup(home_response.text, 'html.parser')
                csrf_meta = soup.find('meta', {'name': 'csrf-token'})
                
                if not csrf_meta:
                    return None
                
                csrf_token = csrf_meta['content']
                
                post_data = {
                    'draw': '1',
                    'columns[0][data]': 'PRODUCT_ID',
                    'columns[0][searchable]': 'false',
                    'columns[0][orderable]': 'false',
                    'columns[1][data]': 'PRODUCT_REGISTER',
                    'columns[1][searchable]': 'false',
                    'columns[1][orderable]': 'false',
                    'columns[2][data]': 'PRODUCT_NAME',
                    'columns[2][searchable]': 'false',
                    'columns[2][orderable]': 'false',
                    'columns[3][data]': 'MANUFACTURER_NAME',
                    'columns[3][searchable]': 'false',
                    'columns[3][orderable]': 'false',
                    'start': '0',
                    'length': '10',
                    'search[value]': '',
                    'search[regex]': 'false',
                    'query': search_query 
                }
                
                search_headers = self.headers.copy()
                search_headers.update({
                    'X-CSRF-TOKEN': csrf_token,
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Referer': f'{self.base_url}/all-produk',
                    'Origin': self.base_url,
                })

                api_url = f'{self.base_url}/produk-dt/all'
                response = await client.post(api_url, data=post_data, headers=search_headers, cookies=home_response.cookies)
                
                if response.status_code == 200:
                    result = response.json()
                    if result.get('recordsFiltered', 0) > 0:
                        raw = result['data'][0]
                        return self._format_product(raw)
                
                return None

            except Exception as e:
                print(f"Scraper Exception for query '{search_query}': {e}")
                return None

    def _format_product(self, raw: Dict) -> Dict:
        return {
            'bpom_number': raw.get('PRODUCT_REGISTER', 'Tidak Diketahui'),
            'product_name': raw.get('PRODUCT_NAME', 'Nama Produk Tidak Tersedia'),
            'brand': raw.get('PRODUCT_BRANDS') or "-",
            'manufacturer': raw.get('MANUFACTURER_NAME') or raw.get('REGISTRAR') or "-",
            'address': raw.get('MANUFACTURER_ADDRESS') or raw.get('REGISTRAR_ADD') or "-",
            'issued_date': raw.get('PRODUCT_DATE') or raw.get('SUBMIT_DATE') or "-",
            'expired_date': raw.get('PRODUCT_EXPIRED') or "-",
            'composition': raw.get('INGREDIENTS') or "Komposisi tidak tersedia",
            'packaging': raw.get('PRODUCT_PACKAGE') or "-",
            'status': raw.get('STATUS') or "Berlaku",
            'qr_code': raw.get('PRODUCT_QR') or None
        }