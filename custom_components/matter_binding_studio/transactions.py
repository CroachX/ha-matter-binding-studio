"""Serialize Studio mutations, including shared target ACL/key tables.

A conservative integration-wide lock also protects group ID allocation and
private metadata. It does not lock other Matter controllers or integrations.
"""
import asyncio
from functools import wraps


def serialized_write(operation):
    @wraps(operation)
    async def wrapped(hass, *args, **kwargs):
        data = hass.data.setdefault("matter_binding_studio", {})
        lock = data.setdefault("_transaction_lock", asyncio.Lock())
        async with lock:
            return await operation(hass, *args, **kwargs)
    return wrapped
