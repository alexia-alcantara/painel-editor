import { test, expect } from '@playwright/test';

test.describe('drag and drop', () => {

  test('deve arrastar o componente de título para uma nova posição lentamente', async ({ page }) => {

    
    await page.goto('/editor');

    const tituloComponent = page.getByTestId('componente-titulo');
    await expect(tituloComponent).toBeVisible();

    const componentBox = await tituloComponent.boundingBox();
    expect(componentBox).not.toBeNull();

    // Posições X e Y Absolutas (relativas à tela)
    const startX = componentBox!.x + (componentBox!.width / 2); // Centro do componente
    const startY = componentBox!.y + (componentBox!.height / 2);
    
    const targetX = startX + 100;
    const targetY = startY + 50;

    
    // 1. Mover o mouse para o centro do componente
    await page.mouse.move(startX, startY);
    await page.waitForTimeout(100); 

    // 2. Clicar e segurar
    await page.mouse.down();
    await page.waitForTimeout(100); // Pausa para o 'click' registrar

    // 3. Mover o mouse para a posição alvo LENTAMENTE (em 2 passos)
    // Isso dá tempo para o cdkDrag processar os 'mousemove'
    await page.mouse.move(startX + 50, startY + 25); // Metade do caminho
    await page.waitForTimeout(200); // Simula o arraste...
    
    await page.mouse.move(targetX, targetY); // Posição final
    await page.waitForTimeout(200); // ...terminando o arraste

    // 4. Soltar o mouse
    await page.mouse.up();

    
    // Dê ao Angular tempo para processar o (cdkDragEnded) e re-renderizar
    await page.waitForTimeout(300); 

    // Verifique a nova posição
    const finalBox = await tituloComponent.boundingBox();
    expect(finalBox).not.toBeNull();

    // Verifique o centro do componente
    const finalCenterX = finalBox!.x + (finalBox!.width / 2);
    const finalCenterY = finalBox!.y + (finalBox!.height / 2);

    // O 'toBeCloseTo' aceita uma margem de erro
    expect(finalCenterX).toBeCloseTo(targetX, 2);
    expect(finalCenterY).toBeCloseTo(targetY, 2);
  });
});