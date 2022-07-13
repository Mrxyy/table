import { ActionIcon, Group } from "@mantine/core";
import React from "react";
import { Control, Controller, UseFieldArrayRemove } from "react-hook-form";
import { Trash } from "tabler-icons-react";
import { TemplateVariableField } from "../../../../utils/template/editor";
import { IVizStatsConf } from "../types";

interface VariableField {
  control: Control<IVizStatsConf, any>;
  index: number;
  remove: UseFieldArrayRemove;
  data: any[];
}

export function VariableField({ control, index, remove, data }: VariableField) {
  return (
    <Group key={index} direction="column" grow my="sm" p={0} sx={{ border: '1px solid #eee', borderTopColor: '#333', borderTopWidth: 2, position: 'relative' }}>
      <Controller
        name={`variables.${index}`}
        control={control}
        render={(({ field }) => (
          <TemplateVariableField data={data} {...field} />
        ))}
      />
      <ActionIcon
        color="red"
        variant="hover"
        onClick={() => remove(index)}
        sx={{ position: 'absolute', top: 15, right: 5 }}
      >
        <Trash size={16} />
      </ActionIcon>
    </Group >

  )
}