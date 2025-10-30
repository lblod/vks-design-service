### `GET /ar-designs`
Returns a list of `mobiliteit:AanvullendReglementOntwerp` resources.

**Attributes:**
- `uri`
- `id` (based on a generated `mu:uuid`)
- `name`
- `date`

**Relationships**
- `measure-designs` (hasMany)

### `GET /ar-designs/<id>/measure-designs`
Returns the list of `mobiliteit:MobiliteitsmaatregelOntwerp` connected to `<id>`.

**Attributes**
- `uri`
- `id` (based on a generated `mu:uuid`)
- (optional) `status`

**Relationships**
- `measure-concept` (belongsTo)
- `variable-instances` (hasMany, not including instruction-variables)
- `traffic-signals` (hasMany)

### `GET /measure-designs/<id>/measure-concept`
Return the measure-concept which measure-design `<id>` is based on

**Attributes**
- `uri`
- `id`
- `label`
- `template-string`
- `raw-template-string`


### `GET /measure-designs/<id>/variable-instances`
Returns variable-instance resources for `<id>`.
This is a derived resource which combines information from variables (from the registry) and variable-instances (from the AWV tool, if it exists).
It gets a new auto-generated `id` and `uri`.

**Attributes**
- `uri` (generated on-the-fly)
- `id` (generated on-the-fly)
- `label`
- `type`
- `value` (if it exists)
- `defaultValue` (if it exists)
- `variableURI`

**Relationships**
- `variable` (belongsTo)

### `GET /variable-instances/<id>/variable`
Returns the 


### `GET /measure-designs/<id>/traffic-signals`
Returns a list of traffic-signals defined by the AWV drawing tool.

**Attributes**
- `uri`
- `id`

**Relationships**
- `traffic-signal-concept`

### `GET /traffic-signals/<id>/traffic-signal-concept`
Return the traffic-signal-concept resource which `<id>` is based on.

**Attributes**
- `uri`
- `id`
- `meaning`
- `code`

**Relationships**
None


### Notes
- When fetching `hasMany` rels, it will by default contain all resources (no default pagination)