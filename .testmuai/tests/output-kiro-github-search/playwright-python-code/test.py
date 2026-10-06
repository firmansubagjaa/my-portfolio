import os
import testmu
from testmu import expect, var, set_var
from playwright.async_api import Page

testmu.configure(
    build="a428b1fc-bd3f-4365-8f91-f702f247a90a",
    name="Search for 'kiro' on GitHub",
    tc_id="TC-1",
    network=os.getenv("NETWORK", "false").lower() == "true",
    auto_heal_version="AH2",
    default_action_timeout_ms=60000,
    default_navigation_timeout_ms=60000,
    kane_run_v4=True,
)

@testmu.test
async def test(page: Page):
    async with testmu.step('Navigate to https://github.com', instruction_id='d5e4652d-8ac2-44be-8be9-d1d0c02e64e1'):
        await page.goto("https://github.com")
    
    async with testmu.step('Clicking the site search control in the header', instruction_id='af2d4d14-c193-4f76-bf37-3701937917e4'):
        _loc_1 = page.locator("internal:role=button[name=\"Search or jump to, type / to\"i]")
        
        await _loc_1.click()
    
    async with testmu.step('Scroll into view: PRIMARY: GitHub search input; role=combobox; text="Search or jump to" | HINTS: container=Quick search dialog', instruction_id='03c70de3-95c9-4c79-bbd9-8e38c586dfca'):
        element_0 = page.locator("internal:role=combobox[name=\"Search or jump to\"i]")
        await element_0.evaluate("el => el.scrollIntoView({block: 'center'})")
    
    async with testmu.step('Typing kiro in GitHub search box', instruction_id='86709135-35f1-48cc-9f72-07df65bd9f3b'):
        element_1 = page.locator("internal:role=combobox[name=\"Search or jump to\"i]")
        
        await element_1.click()
        await element_1.fill("kiro")
    
    async with testmu.step('Pressing the Enter key to submit the GitHub search query', instruction_id='de5f2a5d-0ba7-426a-9696-3275e0e0942e'):
        await page.wait_for_timeout(500)
        await page.keyboard.press('Enter')


if __name__ == "__main__":
    testmu.run(test)