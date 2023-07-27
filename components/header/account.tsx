import Button from '@/packages/button';
import { isIndent } from '@/utils';
import { Popover } from 'antd';

function Account({ account }: {account:string}) { 

    return  <Popover content={''} title="Title">
        <Button >{isIndent(account) }</Button>
  </Popover>
  
}

export default Account