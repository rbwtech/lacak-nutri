import httpx
from bs4 import BeautifulSoup
from typing import Dict, Optional

class BPOMScraper:
    def __init__(self):
        self.base_url = "https://cekbpom.pom.go.id"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }

    async def search_bpom(self, bpom_number: str) -> Optional[Dict]:
        """Mencari data produk berdasarkan nomor registrasi BPOM secara Async"""
        async with httpx.AsyncClient(timeout=45.0, follow_redirects=True) as client:
            try:
                # 1. GET Homepage untuk CSRF & Cookies
                home_response = await client.get(self.base_url, headers=self.headers)
                soup = BeautifulSoup(home_response.text, 'html.parser')
                csrf_meta = soup.find('meta', {'name': 'csrf-token'})
                
                if not csrf_meta:
                    print("CSRF Token not found")
                    return None
                
                csrf_token = csrf_meta['content']
                
                # 2. Prepare Data
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
                    'query': bpom_number # Keyword
                }
                
                search_headers = self.headers.copy()
                search_headers.update({
                    'X-CSRF-TOKEN': csrf_token,
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Referer': f'{self.base_url}/all-produk',
                    'Origin': self.base_url,
                })

                # 3. POST Search
                api_url = f'{self.base_url}/produk-dt/all'
                response = await client.post(api_url, data=post_data, headers=search_headers, cookies=home_response.cookies)
                
                if response.status_code == 200:
                    result = response.json()
                    if result.get('recordsFiltered', 0) > 0:
                        # Mengambil item pertama
                        raw = result['data'][0]
                        return self._format_product(raw)
                    return None
                else:
                    print(f"BPOM API Error: {response.status_code}")
                    return None

            except Exception as e:
                print(f"Scraper Exception: {e}")
                return None

    def _format_product(self, raw: Dict) -> Dict:
        return {
            'bpom_number': raw.get('PRODUCT_REGISTER', ''),
            'product_name': raw.get('PRODUCT_NAME', ''),
            'brand': raw.get('PRODUCT_BRANDS', ''),
            'manufacturer': raw.get('MANUFACTURER_NAME', ''),
            'address': raw.get('MANUFACTURER_ADDRESS', ''),
            'issued_date': raw.get('PRODUCT_DATE', ''),
            'expired_date': raw.get('PRODUCT_EXPIRED', ''),
            'composition': raw.get('INGREDIENTS', ''),
            'packaging': raw.get('PRODUCT_PACKAGE', ''),
            'status': raw.get('STATUS', ''),
            'qr_code': raw.get('PRODUCT_QR', '')
        }