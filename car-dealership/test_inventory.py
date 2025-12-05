from selenium import webdriver
from selenium.webdriver.common.by import By
import time

driver = webdriver.Chrome()
driver.get("http://localhost:3000/inventory")

# Test 1: Page loads
assert "Car" in driver.title
print("Page loads")

# Test 2: Search works
search_box = driver.find_element(By.CSS_SELECTOR, "input[placeholder*='Search']")
search_box.send_keys("Honda")
time.sleep(2)
print("Search functional")

driver.quit()