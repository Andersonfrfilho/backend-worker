/**
 * Script para testar validação de mensagens RabbitMQ via Node.js
 * Execute: npx ts-node scripts/test-validation-messages.ts
 */

interface TestCase {
  name: string;
  payload: any;
  shouldPass: boolean;
  description: string;
}

const testCases: TestCase[] = [
  {
    name: 'Mensagem Válida Completa',
    shouldPass: true,
    description: 'Todos os campos preenchidos corretamente',
    payload: {
      type: 'user-welcome',
      userId: '123',
      email: 'valid@example.com',
      name: 'Test User',
      template: 'welcome-template',
    },
  },
  {
    name: 'Mensagem Válida Mínima',
    shouldPass: true,
    description: 'Apenas campos obrigatórios',
    payload: {
      type: 'password-reset',
      userId: '456',
      email: 'user@example.com',
    },
  },
  {
    name: 'Email Inválido',
    shouldPass: false,
    description: 'Email sem formato válido',
    payload: {
      type: 'user-welcome',
      userId: '123',
      email: 'invalid-email',
    },
  },
  {
    name: 'Type Inválido',
    shouldPass: false,
    description: 'Type não está no enum permitido',
    payload: {
      type: 'invalid-type',
      userId: '123',
      email: 'valid@example.com',
    },
  },
  {
    name: 'UserId Ausente',
    shouldPass: false,
    description: 'Campo obrigatório userId não foi fornecido',
    payload: {
      type: 'user-welcome',
      email: 'valid@example.com',
    },
  },
  {
    name: 'Email Ausente',
    shouldPass: false,
    description: 'Campo obrigatório email não foi fornecido',
    payload: {
      type: 'user-welcome',
      userId: '123',
    },
  },
  {
    name: 'Type Ausente',
    shouldPass: false,
    description: 'Campo obrigatório type não foi fornecido',
    payload: {
      userId: '123',
      email: 'valid@example.com',
    },
  },
  {
    name: 'Propriedades Extras',
    shouldPass: false,
    description: 'Campos não definidos no DTO',
    payload: {
      type: 'user-welcome',
      userId: '123',
      email: 'valid@example.com',
      extraField: 'not-allowed',
      anotherExtra: 999,
    },
  },
  {
    name: 'UserId Muito Longo',
    shouldPass: false,
    description: 'UserId com mais de 100 caracteres',
    payload: {
      type: 'user-welcome',
      userId: 'a'.repeat(101),
      email: 'valid@example.com',
    },
  },
  {
    name: 'Name Muito Longo',
    shouldPass: false,
    description: 'Name com mais de 200 caracteres',
    payload: {
      type: 'user-welcome',
      userId: '123',
      email: 'valid@example.com',
      name: 'a'.repeat(201),
    },
  },
  {
    name: 'Type System Alert',
    shouldPass: true,
    description: 'Testando outro tipo válido do enum',
    payload: {
      type: 'system-alert',
      userId: '789',
      email: 'admin@example.com',
    },
  },
];

async function sendToRabbitMQ(payload: any): Promise<{ routed: boolean }> {
  const response = await fetch('http://localhost:15672/api/exchanges/%2f/notifications/publish', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + Buffer.from('guest:guest').toString('base64'),
    },
    body: JSON.stringify({
      properties: {},
      routing_key: 'email.notifications',
      payload: JSON.stringify(payload),
      payload_encoding: 'string',
    }),
  });

  return response.json();
}

async function runTests() {
  console.log('🧪 Iniciando Testes de Validação de Mensagens RabbitMQ');
  console.log('=' .repeat(80));
  console.log('');

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    const icon = testCase.shouldPass ? '✅' : '❌';
    console.log(`${icon} ${testCase.name}`);
    console.log(`   Descrição: ${testCase.description}`);
    console.log(`   Payload: ${JSON.stringify(testCase.payload)}`);

    try {
      const result = await sendToRabbitMQ(testCase.payload);

      if (result.routed) {
        console.log('   ✓ Mensagem enviada ao RabbitMQ');
        console.log('   ℹ Verifique os logs do worker para ver se foi processada ou rejeitada');
      } else {
        console.log('   ✗ Mensagem não foi roteada (exchange ou queue não existe?)');
      }

      passed++;
    } catch (error) {
      console.log(`   ✗ Erro ao enviar: ${error.message}`);
      failed++;
    }

    console.log('');
    // Pequeno delay para não sobrecarregar
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log('=' .repeat(80));
  console.log(`📊 Resumo:`);
  console.log(`   Total de testes: ${testCases.length}`);
  console.log(`   Mensagens enviadas: ${passed}`);
  console.log(`   Erros ao enviar: ${failed}`);
  console.log('');
  console.log('📋 Próximos passos:');
  console.log('   1. Verifique os logs do worker para ver as validações');
  console.log('   2. Mensagens válidas devem ser processadas com sucesso');
  console.log('   3. Mensagens inválidas devem gerar erros de validação detalhados');
  console.log('');
  console.log('💡 Dica: Execute `docker-compose logs -f worker` para ver os logs em tempo real');
}

// Executar testes
runTests().catch(console.error);
