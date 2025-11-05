import { test, expect } from '@playwright/test';

test('deve navegar para a página do painel e verificar o título', async ({ page }) => {
  await page.goto('/editor'); 

  // 1. Verifique se o título da página está correto (Exemplo)
  await expect(page).toHaveTitle(/PainelAngular/);

  await expect(page.getByRole('heading', { name: 'Título da Reunião' })).toBeVisible();

  await expect(page.locator('app-editor')).toBeVisible();

  await expect(page.getByText('Nome do Orador')).toBeVisible();
});