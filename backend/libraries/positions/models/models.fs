module positions.model 

/*
ENTITIES
document = order-confirmation | invoice
documentBase = id, etc.
invoice = { documentBase, header, positions }
invoiceHeader = { purchaseOrderNumber }
positions = { header, lines:List<position> }
positionsHeader = { total }
position = { id, idFields, numberFields, stringFields, valutaFields, ... }
vat = { id, percentage }
product = { id, price }


EVENTS
TenantEvent of (TenantEventBase = tenantId) * (Source = User | (System of predecessorId))
  | DocumentCreatedEvent of TenantEventBase * DocumentCreation
  | InvoiceEvent of TenantEventBase * UpdatePositions
DocumentCreation = DeliveryNoteCreated of PurchaseOrderNumber * EventDescriptorId

UpdatePositions = 
  | UpdateSingle<Positions, PositionsIdFields, PositionsStringFields, PositionsNumberFields, ..., TenantEvent>
  | UpdatePosition of 
  | UpdateSingle<Position, PositionIdFields, PositionStringFields, PositionNumberFields, ..., TenantEvent>
  | UpdateBatch<Position, PositionIdBatchFields, PositionStringBatchFields, PositionNumberBatchFields, ..., TenantEvent>

UpdateSingle<Entity, ..., ProducedEvent> = EventDescriptorId<Entity, ProducedEvent> * ...
UpdateBatch<Entity, ..., ProducedEvent> = EventDescriptorId<Entity, ProducedEvent> * ...

EVENT-DESCRIPTORS
EventDescriptor<Entity, Event> = Id
dependencies:
  // the chain of Ids of the specific nesting,  the current entity to a series of (synthetic) events to enqueue
  Map<List<EventDescriptorId>,                  Entity -> Array<Event>>

FIELD-DESCRIPTORS
type FieldDescriptor<E,F> = id, (path:...the same hierarchy as the updaters that guarantees to get an F from an E incl. setter, ex. docId, posId, fieldName...)
dependencies:
  Map<FieldPath<E, F>, E -> Array<BusinessRule>

BusinessRule = BoolExpr (defined in terms of comparisons of FieldPaths and Constants) * Array<Assignment>
Assignment = Array<FieldPath * Expr (defined in terms of comparisons of FieldPaths and Constants)>


EVENT-HANDLERS
invoiceJobs = 
  co.Any([
    co.On(DeliveryNoteCreated, fun e -> 
      ...
    )
    co.On(InvoiceEvent(docId, UpdatePositionsField x N per positions field type T(fieldDescriptor, newValue:T)
      // UpdatePosition(UpdateSingle(positionId, UpdateSingle(UpdateId(newId, fieldName))))
      )), fun e -> 
      co.Do(fun ctx -> ctx.Invoices.update(
        fieldDescriptor.path = [docId, positionId, fieldName], // fieldPath, a polymorphic thingy
        newId
      )) // the update writes immediately to the database and adds to the state the post rules
    ) // the matched event has a chain of EventDescriptorId's, the post events are enqueued afterwards
  ])
*/

