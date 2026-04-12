#!/usr/bin/env python3
"""
Comprehensive Backend API Test Suite for Nebula Cascade
Tests all backend endpoints as specified in the review request.
"""

import requests
import json
import sys
import time
from typing import Dict, Any, Optional

# Backend URL from frontend environment
BACKEND_URL = "https://lovable-confirm.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        self.failed_tests = []
        
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "response_data": response_data
        }
        self.test_results.append(result)
        if not success:
            self.failed_tests.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"    {details}")
        if not success and response_data:
            print(f"    Response: {response_data}")
        print()

    def test_basic_endpoints(self):
        """Test basic API endpoints"""
        print("=== Testing Basic Endpoints ===")
        
        # Test root endpoint
        try:
            response = self.session.get(f"{API_BASE}/")
            if response.status_code == 200:
                data = response.json()
                if "Nebula Cascade API" in data.get("message", ""):
                    self.log_test("GET /api/", True, f"Response: {data}")
                else:
                    self.log_test("GET /api/", False, f"Unexpected response: {data}")
            else:
                self.log_test("GET /api/", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("GET /api/", False, f"Exception: {str(e)}")

        # Test status endpoints
        try:
            # Create status check
            status_data = {"client_name": "backend_test"}
            response = self.session.post(f"{API_BASE}/status", json=status_data)
            if response.status_code == 200:
                data = response.json()
                if "id" in data and data.get("client_name") == "backend_test":
                    self.log_test("POST /api/status", True, f"Created status check with ID: {data.get('id')}")
                else:
                    self.log_test("POST /api/status", False, f"Unexpected response: {data}")
            else:
                self.log_test("POST /api/status", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("POST /api/status", False, f"Exception: {str(e)}")

        try:
            # Get status checks
            response = self.session.get(f"{API_BASE}/status")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("GET /api/status", True, f"Retrieved {len(data)} status checks")
                else:
                    self.log_test("GET /api/status", False, f"Expected list, got: {type(data)}")
            else:
                self.log_test("GET /api/status", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("GET /api/status", False, f"Exception: {str(e)}")

    def test_nft_endpoints(self):
        """Test NFT endpoints"""
        print("=== Testing NFT Endpoints ===")
        
        # Test NFT status
        try:
            response = self.session.get(f"{API_BASE}/nft/status")
            if response.status_code == 200:
                data = response.json()
                if "framework_mode" in data and data.get("framework_mode") == True:
                    self.log_test("GET /api/nft/status", True, f"Framework mode confirmed: {data}")
                else:
                    self.log_test("GET /api/nft/status", False, f"Unexpected response: {data}")
            else:
                self.log_test("GET /api/nft/status", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("GET /api/nft/status", False, f"Exception: {str(e)}")

        # Test NFT metadata
        try:
            params = {
                "name": "TestCard",
                "division": "gem_iii",
                "color_hex": "#ff3344"
            }
            response = self.session.get(f"{API_BASE}/nft/metadata/test-card-123", params=params)
            if response.status_code == 200:
                data = response.json()
                required_fields = ["name", "description", "image", "attributes"]
                if all(field in data for field in required_fields):
                    self.log_test("GET /api/nft/metadata/{card_id}", True, f"Valid OpenSea metadata returned")
                else:
                    self.log_test("GET /api/nft/metadata/{card_id}", False, f"Missing required fields: {data}")
            else:
                self.log_test("GET /api/nft/metadata/{card_id}", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("GET /api/nft/metadata/{card_id}", False, f"Exception: {str(e)}")

        # Test metadata validation
        try:
            metadata = {
                "name": "Test Card",
                "description": "A test card for validation",
                "image": "https://example.com/image.png",
                "attributes": [
                    {"trait_type": "Division", "value": "Division III"},
                    {"trait_type": "Rarity", "value": "Rare"}
                ]
            }
            response = self.session.post(f"{API_BASE}/nft/metadata/validate", json=metadata)
            if response.status_code == 200:
                data = response.json()
                if "valid" in data:
                    self.log_test("POST /api/nft/metadata/validate", True, f"Validation result: {data}")
                else:
                    self.log_test("POST /api/nft/metadata/validate", False, f"Unexpected response: {data}")
            else:
                self.log_test("POST /api/nft/metadata/validate", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("POST /api/nft/metadata/validate", False, f"Exception: {str(e)}")

        # Test NFT mint request
        try:
            mint_request = {
                "player_id": "test-player-123",
                "card_id": "test-card-456",
                "recipient_address": "0x742d35Cc6634C0532925a3b8D43C67B8c8B3E9C6"
            }
            response = self.session.post(f"{API_BASE}/nft/mint", json=mint_request)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "recorded_offchain" and "record_id" in data:
                    record_id = data["record_id"]
                    self.log_test("POST /api/nft/mint", True, f"Mint recorded off-chain: {data}")
                    
                    # Test mint status check
                    try:
                        status_response = self.session.get(f"{API_BASE}/nft/mint/{record_id}")
                        if status_response.status_code == 200:
                            status_data = status_response.json()
                            if status_data.get("id") == record_id:
                                self.log_test("GET /api/nft/mint/{record_id}", True, f"Mint status retrieved: {status_data}")
                            else:
                                self.log_test("GET /api/nft/mint/{record_id}", False, f"Unexpected response: {status_data}")
                        else:
                            self.log_test("GET /api/nft/mint/{record_id}", False, f"Status: {status_response.status_code}")
                    except Exception as e:
                        self.log_test("GET /api/nft/mint/{record_id}", False, f"Exception: {str(e)}")
                else:
                    self.log_test("POST /api/nft/mint", False, f"Unexpected response: {data}")
            else:
                self.log_test("POST /api/nft/mint", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("POST /api/nft/mint", False, f"Exception: {str(e)}")

        # Test player NFT cards
        try:
            response = self.session.get(f"{API_BASE}/nft/cards/test-player-123")
            if response.status_code == 200:
                data = response.json()
                if "player_id" in data and "nft_count" in data and "records" in data:
                    self.log_test("GET /api/nft/cards/{player_id}", True, f"Player NFTs retrieved: {data}")
                else:
                    self.log_test("GET /api/nft/cards/{player_id}", False, f"Unexpected response: {data}")
            else:
                self.log_test("GET /api/nft/cards/{player_id}", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("GET /api/nft/cards/{player_id}", False, f"Exception: {str(e)}")

    def test_marketplace_endpoints(self):
        """Test Marketplace endpoints"""
        print("=== Testing Marketplace Endpoints ===")
        
        # Test listing validation
        try:
            listing_request = {
                "card_id": "test-card-789",
                "seller_player_id": "test-seller-123",
                "price_cents": 5000
            }
            response = self.session.post(f"{API_BASE}/marketplace/validate-listing", json=listing_request)
            if response.status_code == 200:
                data = response.json()
                if data.get("valid") == True and data.get("fee_percent") == 5:
                    self.log_test("POST /api/marketplace/validate-listing", True, f"Listing validation passed with 5% fee: {data}")
                else:
                    self.log_test("POST /api/marketplace/validate-listing", False, f"Unexpected response: {data}")
            else:
                self.log_test("POST /api/marketplace/validate-listing", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("POST /api/marketplace/validate-listing", False, f"Exception: {str(e)}")

        # Test purchase validation
        try:
            purchase_request = {
                "listing_id": "test-listing-456",
                "buyer_player_id": "test-buyer-789"
            }
            response = self.session.post(f"{API_BASE}/marketplace/validate-purchase", json=purchase_request)
            if response.status_code == 200:
                data = response.json()
                if data.get("valid") == True:
                    self.log_test("POST /api/marketplace/validate-purchase", True, f"Purchase validation passed: {data}")
                else:
                    self.log_test("POST /api/marketplace/validate-purchase", False, f"Unexpected response: {data}")
            else:
                self.log_test("POST /api/marketplace/validate-purchase", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("POST /api/marketplace/validate-purchase", False, f"Exception: {str(e)}")

        # Test fee structure
        try:
            response = self.session.get(f"{API_BASE}/marketplace/fees")
            if response.status_code == 200:
                data = response.json()
                if "base_fee_percent" in data and data.get("base_fee_percent") == 5:
                    self.log_test("GET /api/marketplace/fees", True, f"Fee structure retrieved: {data}")
                else:
                    self.log_test("GET /api/marketplace/fees", False, f"Unexpected response: {data}")
            else:
                self.log_test("GET /api/marketplace/fees", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("GET /api/marketplace/fees", False, f"Exception: {str(e)}")

        # Test marketplace stats
        try:
            response = self.session.get(f"{API_BASE}/marketplace/stats")
            if response.status_code == 200:
                data = response.json()
                if "total_listings" in data and "updated_at" in data:
                    self.log_test("GET /api/marketplace/stats", True, f"Marketplace stats retrieved: {data}")
                else:
                    self.log_test("GET /api/marketplace/stats", False, f"Unexpected response: {data}")
            else:
                self.log_test("GET /api/marketplace/stats", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("GET /api/marketplace/stats", False, f"Exception: {str(e)}")

    def test_wallet_endpoints(self):
        """Test Wallet endpoints"""
        print("=== Testing Wallet Endpoints ===")
        
        test_player_id = "test-player-wallet-123"
        test_wallet = "0x742d35Cc6634C0532925a3b8D43C67B8c8B3E9C6"
        
        # Test generate sign message
        try:
            response = self.session.get(f"{API_BASE}/wallet/generate-message/{test_player_id}")
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "nonce" in data:
                    self.log_test("GET /api/wallet/generate-message/{player_id}", True, f"Sign message generated: {data}")
                    sign_message = data["message"]
                else:
                    self.log_test("GET /api/wallet/generate-message/{player_id}", False, f"Unexpected response: {data}")
                    sign_message = None
            else:
                self.log_test("GET /api/wallet/generate-message/{player_id}", False, f"Status: {response.status_code}, Response: {response.text}")
                sign_message = None
        except Exception as e:
            self.log_test("GET /api/wallet/generate-message/{player_id}", False, f"Exception: {str(e)}")
            sign_message = None

        # Test wallet link (without signature first)
        try:
            link_request = {
                "player_id": test_player_id,
                "wallet_address": test_wallet,
                "wallet_type": "thirdweb"
            }
            response = self.session.post(f"{API_BASE}/wallet/link", json=link_request)
            if response.status_code == 200:
                data = response.json()
                if data.get("success") == True:
                    self.log_test("POST /api/wallet/link", True, f"Wallet linked successfully: {data}")
                else:
                    self.log_test("POST /api/wallet/link", False, f"Unexpected response: {data}")
            else:
                self.log_test("POST /api/wallet/link", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("POST /api/wallet/link", False, f"Exception: {str(e)}")

        # Test wallet info
        try:
            response = self.session.get(f"{API_BASE}/wallet/info/{test_player_id}")
            if response.status_code == 200:
                data = response.json()
                if data.get("player_id") == test_player_id and data.get("wallet_address") == test_wallet.lower():
                    self.log_test("GET /api/wallet/info/{player_id}", True, f"Wallet info retrieved: {data}")
                else:
                    self.log_test("GET /api/wallet/info/{player_id}", False, f"Unexpected response: {data}")
            else:
                self.log_test("GET /api/wallet/info/{player_id}", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("GET /api/wallet/info/{player_id}", False, f"Exception: {str(e)}")

        # Test wallet unlink
        try:
            response = self.session.delete(f"{API_BASE}/wallet/unlink/{test_player_id}")
            if response.status_code == 200:
                data = response.json()
                if data.get("success") == True:
                    self.log_test("DELETE /api/wallet/unlink/{player_id}", True, f"Wallet unlinked: {data}")
                else:
                    self.log_test("DELETE /api/wallet/unlink/{player_id}", False, f"Unexpected response: {data}")
            else:
                self.log_test("DELETE /api/wallet/unlink/{player_id}", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("DELETE /api/wallet/unlink/{player_id}", False, f"Exception: {str(e)}")

    def test_anticheat_endpoints(self):
        """Test Anti-cheat endpoints"""
        print("=== Testing Anti-cheat Endpoints ===")
        
        # Test valid score validation
        try:
            valid_score = {
                "player_id": "test-player-anticheat-123",
                "score": 3500,
                "level_reached": 5,
                "survival_time_seconds": 120,
                "max_combo": 8,
                "lines_cleared": 15
            }
            response = self.session.post(f"{API_BASE}/anticheat/validate-score", json=valid_score)
            if response.status_code == 200:
                data = response.json()
                if data.get("valid") == True and data.get("risk_level") == "low":
                    self.log_test("POST /api/anticheat/validate-score (valid)", True, f"Valid score accepted: {data}")
                else:
                    self.log_test("POST /api/anticheat/validate-score (valid)", False, f"Unexpected response: {data}")
            else:
                self.log_test("POST /api/anticheat/validate-score (valid)", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("POST /api/anticheat/validate-score (valid)", False, f"Exception: {str(e)}")

        # Test suspicious score validation
        try:
            suspicious_score = {
                "player_id": "test-player-anticheat-456",
                "score": 99999,
                "level_reached": 1,
                "survival_time_seconds": 3,
                "max_combo": 50,
                "lines_cleared": 100
            }
            response = self.session.post(f"{API_BASE}/anticheat/validate-score", json=suspicious_score)
            if response.status_code == 200:
                data = response.json()
                if data.get("valid") == False and data.get("risk_level") in ["high", "critical"]:
                    self.log_test("POST /api/anticheat/validate-score (suspicious)", True, f"Suspicious score flagged: {data}")
                else:
                    self.log_test("POST /api/anticheat/validate-score (suspicious)", False, f"Unexpected response: {data}")
            else:
                self.log_test("POST /api/anticheat/validate-score (suspicious)", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("POST /api/anticheat/validate-score (suspicious)", False, f"Exception: {str(e)}")

        # Test thresholds
        try:
            response = self.session.get(f"{API_BASE}/anticheat/thresholds")
            if response.status_code == 200:
                data = response.json()
                if "score_per_second_max" in data and "combo_per_level_max" in data:
                    self.log_test("GET /api/anticheat/thresholds", True, f"Thresholds retrieved: {data}")
                else:
                    self.log_test("GET /api/anticheat/thresholds", False, f"Unexpected response: {data}")
            else:
                self.log_test("GET /api/anticheat/thresholds", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("GET /api/anticheat/thresholds", False, f"Exception: {str(e)}")

        # Test status
        try:
            response = self.session.get(f"{API_BASE}/anticheat/status")
            if response.status_code == 200:
                data = response.json()
                if data.get("active") == True and "checks" in data:
                    self.log_test("GET /api/anticheat/status", True, f"Anti-cheat status retrieved: {data}")
                else:
                    self.log_test("GET /api/anticheat/status", False, f"Unexpected response: {data}")
            else:
                self.log_test("GET /api/anticheat/status", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("GET /api/anticheat/status", False, f"Exception: {str(e)}")

    def test_edge_cases(self):
        """Test edge cases and error handling"""
        print("=== Testing Edge Cases ===")
        
        # Test invalid wallet address
        try:
            invalid_wallet_request = {
                "player_id": "test-player-edge",
                "wallet_address": "not_a_wallet",
                "wallet_type": "thirdweb"
            }
            response = self.session.post(f"{API_BASE}/wallet/link", json=invalid_wallet_request)
            if response.status_code == 422:  # Validation error
                self.log_test("POST /api/wallet/link (invalid address)", True, "Invalid wallet address rejected correctly")
            else:
                self.log_test("POST /api/wallet/link (invalid address)", False, f"Expected 422, got {response.status_code}")
        except Exception as e:
            self.log_test("POST /api/wallet/link (invalid address)", False, f"Exception: {str(e)}")

        # Test negative price in marketplace
        try:
            negative_price_request = {
                "card_id": "test-card-edge",
                "seller_player_id": "test-seller-edge",
                "price_cents": -100
            }
            response = self.session.post(f"{API_BASE}/marketplace/validate-listing", json=negative_price_request)
            if response.status_code == 422:  # Validation error
                self.log_test("POST /api/marketplace/validate-listing (negative price)", True, "Negative price rejected correctly")
            else:
                self.log_test("POST /api/marketplace/validate-listing (negative price)", False, f"Expected 422, got {response.status_code}")
        except Exception as e:
            self.log_test("POST /api/marketplace/validate-listing (negative price)", False, f"Exception: {str(e)}")

        # Test invalid score (negative)
        try:
            invalid_score = {
                "player_id": "test-player-edge",
                "score": -1000,
                "level_reached": 1,
                "survival_time_seconds": 60,
                "max_combo": 5,
                "lines_cleared": 10
            }
            response = self.session.post(f"{API_BASE}/anticheat/validate-score", json=invalid_score)
            if response.status_code == 400:  # Bad request
                self.log_test("POST /api/anticheat/validate-score (negative score)", True, "Negative score rejected correctly")
            else:
                self.log_test("POST /api/anticheat/validate-score (negative score)", False, f"Expected 400, got {response.status_code}")
        except Exception as e:
            self.log_test("POST /api/anticheat/validate-score (negative score)", False, f"Exception: {str(e)}")

        # Test non-existent record ID
        try:
            response = self.session.get(f"{API_BASE}/nft/mint/non-existent-record-id")
            if response.status_code == 404:
                self.log_test("GET /api/nft/mint/{non_existent_id}", True, "Non-existent record ID handled correctly")
            else:
                self.log_test("GET /api/nft/mint/{non_existent_id}", False, f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_test("GET /api/nft/mint/{non_existent_id}", False, f"Exception: {str(e)}")

    def run_all_tests(self):
        """Run all test suites"""
        print(f"🚀 Starting Backend API Tests for {BACKEND_URL}")
        print("=" * 60)
        
        self.test_basic_endpoints()
        self.test_nft_endpoints()
        self.test_marketplace_endpoints()
        self.test_wallet_endpoints()
        self.test_anticheat_endpoints()
        self.test_edge_cases()
        
        self.print_summary()

    def print_summary(self):
        """Print test summary"""
        print("=" * 60)
        print("🏁 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = total_tests - len(self.failed_tests)
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if self.failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in self.failed_tests:
                print(f"  - {test['test']}: {test['details']}")
        else:
            print("\n🎉 ALL TESTS PASSED!")

if __name__ == "__main__":
    tester = BackendTester()
    tester.run_all_tests()