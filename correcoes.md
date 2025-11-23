# Correções por página

Separei as correções necessárias por página, analise os erros e faça a correção ou o que foi pedido. 

***IMPORTANTE: Você é um agente e só deve parar as correções quando concluir 100% das correções que foram descritas por página neste documento.***

## /goals

- Erro ao chamar `/analytics/spending-by-category`:
```json
{
    "success": false,
    "data": {
        "error": {
            "code": "INTERNAL_SERVER_ERROR",
            "message": "column Budget.currentSpent does not exist",
            "details": {
                "stack": "QueryFailedError: column Budget.currentSpent does not exist\n    at PostgresQueryRunner.query (C:\\Users\\gabri\\Desktop\\PORTIFOLIO\\Financial-banking-analytics-backend\\node_modules\\typeorm\\driver\\src\\driver\\postgres\\PostgresQueryRunner.ts:325:19)\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\n    at async SelectQueryBuilder.loadRawResults (C:\\Users\\gabri\\Desktop\\PORTIFOLIO\\Financial-banking-analytics-backend\\node_modules\\typeorm\\query-builder\\src\\query-builder\\SelectQueryBuilder.ts:3868:25)\n    at async SelectQueryBuilder.executeEntitiesAndRawResults (C:\\Users\\gabri\\Desktop\\PORTIFOLIO\\Financial-banking-analytics-backend\\node_modules\\typeorm\\query-builder\\src\\query-builder\\SelectQueryBuilder.ts:3614:26)\n    at async SelectQueryBuilder.getRawAndEntities (C:\\Users\\gabri\\Desktop\\PORTIFOLIO\\Financial-banking-analytics-backend\\node_modules\\typeorm\\query-builder\\src\\query-builder\\SelectQueryBuilder.ts:1671:29)\n    at async SelectQueryBuilder.getMany (C:\\Users\\gabri\\Desktop\\PORTIFOLIO\\Financial-banking-analytics-backend\\node_modules\\typeorm\\query-builder\\src\\query-builder\\SelectQueryBuilder.ts:1761:25)\n    at async AnalyticsService.getSpendingByCategory (C:\\Users\\gabri\\Desktop\\PORTIFOLIO\\Financial-banking-analytics-backend\\src\\modules\\analytics\\analytics.service.ts:224:21)\n    at async AnalyticsController.getSpendingByCategory (C:\\Users\\gabri\\Desktop\\PORTIFOLIO\\Financial-banking-analytics-backend\\src\\modules\\analytics\\analytics.controller.ts:139:18)",
                "name": "QueryFailedError"
            }
        }
    },
    "meta": {
        "timestamp": "2025-11-23T13:03:31.769Z",
        "requestId": "a72b4ddd-6224-443a-9653-f328c05c55f9"
    }
}
``` 